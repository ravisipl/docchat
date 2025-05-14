from sqlalchemy import text
from ..utils.database import engine, Base, SessionLocal
from ..models import user, file_system

def reset_database():
    # Create a session
    db = SessionLocal()
    
    try:
        # Drop all tables with CASCADE
        db.execute(text('DROP SCHEMA public CASCADE;'))
        db.execute(text('CREATE SCHEMA public;'))
        db.execute(text('GRANT ALL ON SCHEMA public TO postgres;'))
        db.execute(text('GRANT ALL ON SCHEMA public TO public;'))
        db.commit()
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("All tables created successfully!")
        
    except Exception as e:
        print(f"Error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Resetting database...")
    reset_database()
    print("Database reset complete!") 