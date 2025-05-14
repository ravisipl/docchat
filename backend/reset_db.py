import os
import sys

# Add the parent directory to Python path so app module can be found
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.reset_db import reset_database

if __name__ == "__main__":
    reset_database()
    print("Database has been reset successfully!") 