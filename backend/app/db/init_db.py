import random
from faker import Faker
from app.db.session import SessionLocal
from app.models.user import User
from app.models.application import Application, ApplicationStatus, GermanLevel, ApplicationHistory
from app.models.network import NetworkContact
from app.models.point_history import PointHistory
from datetime import datetime, timedelta
from app.core.security import get_password_hash

fake = Faker('de_DE')

def create_application_with_history(db, user_id, company, position, final_status, transitions, days_ago_start):
    """
    Helper to create an application and its history transitions.
    transitions[0] is baseline (Applied).
    Records transitions: transitions[i-1] -> transitions[i]
    """
    # User requirement: All status starts from Applied.
    if not transitions or transitions[0] != ApplicationStatus.APPLIED:
        transitions = [ApplicationStatus.APPLIED] + transitions
    
    app = Application(
        user_id=user_id,
        company_name=company,
        position_title=position,
        location=fake.city(),
        job_url=fake.url(),
        salary_range=f"€{random.randint(50, 90)}k - €{random.randint(90, 130)}k",
        tech_stack=fake.sentence(nb_words=5),
        status=final_status,
        visa_sponsorship=random.choice([True, False]),
        german_requirement=random.choice([GermanLevel.NONE, GermanLevel.BASIC, GermanLevel.FLUENT]),
        relocation_support=random.choice([True, False]),
        job_board_source=random.choice(["LinkedIn", "Indeed", "Company Website", "Xing"]),
        priority_stars=random.randint(1, 5),
        notes=f"Application journey for {company}",
        applied_date=(datetime.utcnow() - timedelta(days=days_ago_start)).date()
    )
    db.add(app)
    db.flush()
    
    # Points for initial application
    db.add(PointHistory(
        user_id=user_id, 
        points=2, 
        reason=f"Applied to {company}", 
        reference_type="application", 
        reference_id=app.id,
        created_at=datetime.utcnow() - timedelta(days=days_ago_start)
    ))
    
    # Process transitions starting from index 1 (Applied is index 0)
    current_days_ago = days_ago_start
    
    for i in range(1, len(transitions)):
        prev_status = transitions[i-1]
        current_status = transitions[i]
        
        # gap calculation to space out transitions over time
        gap = random.randint(3, 10)
        current_days_ago -= gap
        if current_days_ago < 0: current_days_ago = 0
        
        db.add(ApplicationHistory(
            application_id=app.id,
            old_status=prev_status,
            new_status=current_status,
            notes=f"Status update: {prev_status.value} -> {current_status.value}",
            changed_at=datetime.utcnow() - timedelta(days=current_days_ago)
        ))
        
        # Points for status updates
        db.add(PointHistory(
            user_id=user_id, 
            points=1, 
            reason=f"Updated status for {company}", 
            reference_type="application", 
            reference_id=app.id,
            created_at=datetime.utcnow() - timedelta(days=current_days_ago)
        ))
        
    return app

def init_db():
    db = SessionLocal()
    
    # 1. Create/Get Demo User
    demo_user = db.query(User).filter(User.email == "demo@demo.com").first()
    if not demo_user:
        demo_user = User(
            name="Demo User",
            email="demo@demo.com",
            hashed_password=get_password_hash("demo"),
            current_education="B.Sc. Computer Science",
            german_level="B2",
            current_role="Junior Developer",
            level=1,
            level_name="Novice Seeker",
            current_streak=7,
            longest_streak=12
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    print("Seeding database with refined transitions (No NULL old_status)...")
    
    # --- DEMO DATA PATHS (Requested by user) ---
    
    # 1. Applied -> Rejected
    create_application_with_history(db, demo_user.id, "TechCorp Berlin", "Frontend Developer", 
        ApplicationStatus.REJECTED, [ApplicationStatus.APPLIED, ApplicationStatus.REJECTED], 60)

    # 2. Applied -> Phone Screen -> Rejected
    # Including 'Replied' as a natural step before phone screen
    create_application_with_history(db, demo_user.id, "DataFlow Munich", "Software Engineer", 
        ApplicationStatus.REJECTED, [ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.REJECTED], 55)

    # 3. Applied -> Phone Screen -> Technical Round 1 -> Rejected
    create_application_with_history(db, demo_user.id, "CloudNine Hamburg", "Backend Engineer", 
        ApplicationStatus.REJECTED, [ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.REJECTED], 50)

    # 4. Applied -> Phone Screen -> Technical Round 2 -> Rejected
    create_application_with_history(db, demo_user.id, "AI-Ventures Dresden", "Fullstack Developer", 
        ApplicationStatus.REJECTED, [ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.TECHNICAL_ROUND_2, ApplicationStatus.REJECTED], 45)

    # 5. Applied -> Phone Screen -> Technical Round 2 -> Final Round -> Rejected
    create_application_with_history(db, demo_user.id, "FinTech Solutions Frankfurt", "Java Developer", 
        ApplicationStatus.REJECTED, [ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.TECHNICAL_ROUND_2, ApplicationStatus.FINAL_ROUND, ApplicationStatus.REJECTED], 42)

    # 6. Applied -> Phone Screen -> Technical Round 2 -> Final Round -> Offer
    create_application_with_history(db, demo_user.id, "GreenEnergy Stuttgart", "Python Developer", 
        ApplicationStatus.OFFER, [ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.TECHNICAL_ROUND_2, ApplicationStatus.FINAL_ROUND, ApplicationStatus.OFFER], 38)

    # --- Additional Edge Cases ---

    # 7. Applied -> Ghosted (Early)
    create_application_with_history(db, demo_user.id, "OldSchool IT", "System Administrator", 
        ApplicationStatus.GHOSTED, [ApplicationStatus.APPLIED, ApplicationStatus.GHOSTED], 70)
    
    # 8. Applied -> Replied -> Ghosted (recruiter reached out but never followed through)
    create_application_with_history(db, demo_user.id, "BioTech Innovations", "DevOps Engineer", 
        ApplicationStatus.GHOSTED, [ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.GHOSTED], 32)

    # 9. Applied -> Replied -> Phone Screen -> Ghosted (Late ghosting)
    create_application_with_history(db, demo_user.id, "FastGrowth Startup", "React Developer", 
        ApplicationStatus.GHOSTED, [ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.GHOSTED], 28)

    # 10. Applied -> Rejected (Immediate/Fast rejection)
    create_application_with_history(db, demo_user.id, "InstaHire", "Junior Dev", 
        ApplicationStatus.REJECTED, [ApplicationStatus.APPLIED, ApplicationStatus.REJECTED], 10)

    # 11. Multiple Technical Rounds then Ghosted
    create_application_with_history(db, demo_user.id, "CyberProtect", "Security Engineer", 
        ApplicationStatus.GHOSTED, [ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.TECHNICAL_ROUND_2, ApplicationStatus.GHOSTED], 48)

    # 12. Active Application (Currently in progress)
    create_application_with_history(db, demo_user.id, "AutoMotive GmbH", "C++ Developer", 
        ApplicationStatus.TECHNICAL_ROUND_2, [ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.TECHNICAL_ROUND_2], 15)

    # 13. Another Active Application (Applied then Replied)
    create_application_with_history(db, demo_user.id, "HealthTech", "Mobile Developer", 
        ApplicationStatus.REPLIED, [ApplicationStatus.APPLIED, ApplicationStatus.REPLIED], 5)

    # 14. Just Applied (Baseline case)
    create_application_with_history(db, demo_user.id, "Berlin Innovates", "UI/UX Designer", 
        ApplicationStatus.APPLIED, [ApplicationStatus.APPLIED], 2)

    # 15. Same company different role rejection history
    create_application_with_history(db, demo_user.id, "Siemens", "Project Manager", 
        ApplicationStatus.REJECTED, [ApplicationStatus.APPLIED, ApplicationStatus.REJECTED], 50)
    create_application_with_history(db, demo_user.id, "Siemens", "Technical Lead", 
        ApplicationStatus.REJECTED, [ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.REJECTED], 25)

    # 16. Long journey then rejected at the very end
    create_application_with_history(db, demo_user.id, "BigBank AG", "Risk Analyst", 
        ApplicationStatus.REJECTED, [
            ApplicationStatus.APPLIED, 
            ApplicationStatus.REPLIED, 
            ApplicationStatus.PHONE_SCREEN, 
            ApplicationStatus.TECHNICAL_ROUND_1, 
            ApplicationStatus.TECHNICAL_ROUND_2, 
            ApplicationStatus.FINAL_ROUND, 
            ApplicationStatus.REJECTED
        ], 65)

    # 17. Path: Applied -> Phone Screen -> Technical Round 1 -> Technical Round 2 -> Ghosted
    create_application_with_history(db, demo_user.id, "LogisticsX", "Data Engineer",
        ApplicationStatus.GHOSTED, [
            ApplicationStatus.APPLIED,
            ApplicationStatus.REPLIED,
            ApplicationStatus.PHONE_SCREEN,
            ApplicationStatus.TECHNICAL_ROUND_1,
            ApplicationStatus.TECHNICAL_ROUND_2,
            ApplicationStatus.GHOSTED
        ], 58)

    # --- Network Contacts ---
    contacts = [
        {"name": "Sarah Müller", "company": "TechCorp Berlin", "email": "s.mueller@techcorp.de"},
        {"name": "Hans Wagner", "company": "AI-Ventures Dresden", "email": "h.wagner@ai-ventures.com"},
        {"name": "Petra Klein", "company": "Siemens", "email": "p.klein@siemens.com"},
        {"name": "Markus Weber", "company": "AutoMotive GmbH", "email": "m.weber@automotive.de"},
        {"name": "Julia Fischer", "company": "HealthTech", "email": "j.fischer@healthtech.com"},
    ]
    
    for c_data in contacts:
        contact = NetworkContact(
            user_id=demo_user.id,
            name=c_data["name"],
            company=c_data["company"],
            email=c_data["email"],
            relationship_type="LinkedIn Connection",
            connection_strength=3,
            last_contact_date=(datetime.utcnow() - timedelta(days=random.randint(1, 30))).date(),
            notes=fake.sentence()
        )
        db.add(contact)
        db.flush()
        db.add(PointHistory(
            user_id=demo_user.id, 
            points=1, 
            reason=f"Connected with {contact.name}", 
            reference_type="network_contact", 
            reference_id=contact.id,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 15))
        ))

    db.commit()
    
    # Refresh demo user to trigger point calculation property if needed, 
    # but we usually care about the level update logic
    db.refresh(demo_user)
    
    # Update level/streak based on accumulated points and dates
    from app.core.gamification import LEVELS
    for level_data in LEVELS:
        if demo_user.points >= level_data["minPoints"]:
            demo_user.level = level_data["level"]
            demo_user.level_name = level_data["name"]
    
    db.commit()
    print(f"✅ Database seeded with {db.query(Application).filter(Application.user_id == demo_user.id).count()} applications for demo user.")
    print(f"✅ Demo user now has {demo_user.points} points.")
    db.close()

if __name__ == "__main__":
    init_db()
