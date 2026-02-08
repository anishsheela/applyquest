import random
from faker import Faker
from app.db.session import SessionLocal
from app.models.user import User
from app.models.application import Application, ApplicationStatus, GermanLevel, ApplicationHistory
from app.models.network import NetworkContact
from datetime import datetime, timedelta

fake = Faker('de_DE')

def init_db():
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(User).first():
        print("Database already seeded. Skipping...")
        db.close()
        return

    print("Seeding database...")
    
    # Create User
    user = User(
        name="Anish Sheela",
        email="anish@example.com",
        current_education="Masters in Computer Science",
        german_level="B1",
        current_role="Senior Software Engineer",
        points=125,
        level=3,
        level_name="Job Hunter",
        current_streak=5,
        longest_streak=12
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    german_levels = list(GermanLevel)
    
    german_companies = [
        "SAP", "Siemens", "Deutsche Telekom", "Allianz", "BMW", "Mercedes-Benz", 
        "Zalando", "HelloFresh", "Delivery Hero", "N26", "Personio", "Celonis", 
        "Trivago", "SoundCloud", "Infineon", "Henkel", "Bayer", "BASF", "Adidas", 
        "Puma", "Volkswagen", "Bosch", "Lufthansa", "Deutsche Bank", "Commerzbank",
        "Trade Republic", "GetYourGuide", "Babbel"
    ]

    # Create Network Contacts FIRST (so we can reference them in applications)
    contacts = []
    for _ in range(10):
        contact = NetworkContact(
            user_id=user.id,
            name=fake.name(),
            email=fake.email(),
            company=random.choice(german_companies),
            relationship_type=random.choice(["Recruiter", "Hiring Manager", "Peer", "Alumni"]),
            connection_strength=random.randint(1, 10),
            last_contact_date=fake.date_between(start_date='-60d', end_date='today'),
            notes=fake.text()
        )
        db.add(contact)
        contacts.append(contact)
    
    db.commit()
    for contact in contacts:
        db.refresh(contact)
    
    # Create 50 Applications with diverse outcomes
    applications_to_create = []
    
    # Ensure we have rejections and ghosting from EVERY stage
    patterns = [
        # Rejections from each stage
        ([ApplicationStatus.APPLIED, ApplicationStatus.REJECTED], 3),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.REJECTED], 3),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.REJECTED], 3),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.REJECTED], 3),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.TECHNICAL_ROUND_2, ApplicationStatus.REJECTED], 2),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.TECHNICAL_ROUND_2, ApplicationStatus.FINAL_ROUND, ApplicationStatus.REJECTED], 2),
        
        # Ghosted from each stage
        ([ApplicationStatus.APPLIED, ApplicationStatus.GHOSTED], 2),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.GHOSTED], 2),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.GHOSTED], 2),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.GHOSTED], 2),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.TECHNICAL_ROUND_2, ApplicationStatus.GHOSTED], 2),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.TECHNICAL_ROUND_2, ApplicationStatus.FINAL_ROUND, ApplicationStatus.GHOSTED], 1),
        
        # Success paths
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.TECHNICAL_ROUND_2, ApplicationStatus.FINAL_ROUND, ApplicationStatus.OFFER], 5),
        
        # Active/In-progress at various stages
        ([ApplicationStatus.APPLIED], 3),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED], 2),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN], 2),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1], 2),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.TECHNICAL_ROUND_2], 1),
        ([ApplicationStatus.APPLIED, ApplicationStatus.REPLIED, ApplicationStatus.PHONE_SCREEN, ApplicationStatus.TECHNICAL_ROUND_1, ApplicationStatus.TECHNICAL_ROUND_2, ApplicationStatus.FINAL_ROUND], 1),
    ]
    
    for path_template, count in patterns:
        for _ in range(count):
            applications_to_create.append(path_template)
    
    # Shuffle to randomize order
    random.shuffle(applications_to_create)
    
    for path in applications_to_create:
        final_status = path[-1]
        
        # Generate Times
        start_date = fake.date_between(start_date='-90d', end_date='today')
        current_time = datetime.combine(start_date, datetime.min.time())
        
        # Timestamps for each step
        timestamps = [current_time]
        for _ in range(len(path) - 1):
            # Advance time by 2-10 days for each step
            days_delta = random.randint(2, 10)
            current_time += timedelta(days=days_delta)
            timestamps.append(current_time)

        # Randomly assign a referral contact (30% chance)
        referral_contact_id = None
        if random.random() < 0.3 and contacts:
            referral_contact_id = random.choice(contacts).id

        # German Data Lists
        german_cities = [
            "Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", 
            "Leipzig", "Dresden", "Nuremberg", "Bremen", "Hannover"
        ]
        
        german_companies = [
            "SAP", "Siemens", "Deutsche Telekom", "Allianz", "BMW", "Mercedes-Benz", 
            "Zalando", "HelloFresh", "Delivery Hero", "N26", "Personio", "Celonis", 
            "Trivago", "SoundCloud", "Infineon", "Henkel", "Bayer", "BASF", "Adidas", 
            "Puma", "Volkswagen", "Bosch", "Lufthansa", "Deutsche Bank", "Commerzbank",
            "Trade Republic", "GetYourGuide", "Babbel"
        ]
        
        it_jobs = [
            "Software Engineer", "Senior Software Engineer", "Frontend Developer", 
            "Backend Developer", "Full Stack Developer", "DevOps Engineer", 
            "Data Scientist", "Machine Learning Engineer", "Product Manager", 
            "Scrum Master", "QA Engineer", "Cloud Architect", "Systems Administrator", 
            "Security Engineer", "Engineering Manager", "CTO", "Tech Lead"
        ]

        # Create Application Record
        app = Application(
            user_id=user.id,
            company_name=random.choice(german_companies),
            position_title=random.choice(it_jobs),
            location=random.choice(german_cities),
            job_url=fake.url(),
            salary_range=f"{random.randint(50, 90)}k - {random.randint(90, 140)}k",
            tech_stack="Python, React, Docker, AWS",
            status=final_status,
            visa_sponsorship=random.choice([True, False]),
            german_requirement=random.choice(german_levels),
            relocation_support=random.choice([True, False]),
            job_board_source=random.choice(["LinkedIn", "Indeed", "Glassdoor", "Company Site", "StepStone", "Xing"]),
            priority_stars=random.randint(1, 5),
            notes=fake.text(),
            applied_date=start_date,
            created_at=timestamps[0],
            updated_at=timestamps[-1],
            referral_contact_id=referral_contact_id
        )
        db.add(app)
        db.commit()
        db.refresh(app)
        
        
        # Create History Records
        # Only create history for actual transitions (skip the first "Applied" state)
        for i in range(1, len(path)):
            old_s = path[i-1]
            new_s = path[i]
            
            history = ApplicationHistory(
                application_id=app.id,
                old_status=old_s,
                new_status=new_s,
                notes=f"Transitioned from {old_s} to {new_s}",
                changed_at=timestamps[i]
            )
            db.add(history)
            
        db.commit()

    db.close()
    print("Database seeded successfully with randomized valid transitions!")

if __name__ == "__main__":
    init_db()
