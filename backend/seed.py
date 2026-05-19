"""Run once to seed initial admin and staff users."""
from database import SessionLocal, engine, Base
import models
from auth import hash_password

Base.metadata.create_all(bind=engine)

USERS = [
    {"email": "admin@stocksync.com", "password": "Admin1234!", "role": "admin"},
    {"email": "staff@stocksync.com", "password": "Staff1234!", "role": "staff"},
]


def seed():
    db = SessionLocal()
    try:
        for u in USERS:
            exists = db.query(models.User).filter(models.User.email == u["email"]).first()
            if not exists:
                db.add(models.User(
                    email=u["email"],
                    password_hash=hash_password(u["password"]),
                    role=u["role"],
                ))
                print(f"  Created {u['role']}: {u['email']}")
            else:
                print(f"  Already exists: {u['email']}")
        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
