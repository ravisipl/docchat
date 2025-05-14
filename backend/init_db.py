import os
import sys
from sqlalchemy.orm import Session

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.database import SessionLocal, engine
from app.models.user import User
from app.utils.security import get_password_hash

def init_db():
    # Create all tables
    from app.models.user import Base
    from app.models.document import Document, DocumentChunk
    Base.metadata.create_all(bind=engine)

    # Create admin user if it doesn't exist
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            admin = User(
                email="admin@example.com",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                is_admin=True
            )
            db.add(admin)
            db.commit()
            print("Admin user created successfully!")
        else:
            print("Admin user already exists.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 