from app.db.session import SessionLocal
from app.models.user import User
from app.models.application import Application      # noqa: F401 — needed to resolve SQLAlchemy relationships
from app.models.network import NetworkContact       # noqa: F401
from app.models.point_history import PointHistory   # noqa: F401
from app.core.security import get_password_hash


def init_db():
    db = SessionLocal()

    user = db.query(User).filter(User.email == "aneesh.nl@gmail.com").first()
    if not user:
        user = User(
            name="Anish",
            email="aneesh.nl@gmail.com",
            hashed_password=get_password_hash("Iz648aQZDX0l"),
            current_education="",
            german_level="",
            current_role="",
            level=1,
            level_name="Novice Seeker",
            current_streak=0,
            longest_streak=0
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"✅ Created user: {user.email}")
    else:
        print(f"ℹ️  User already exists: {user.email}")

    db.close()


if __name__ == "__main__":
    init_db()
