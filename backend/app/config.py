import os
from dotenv import load_dotenv
from typing import Dict, Any

# Load environment variables from .env file
load_dotenv()

class Settings:
    def __init__(self):
        # Database settings
        self.DATABASE_URL = os.environ.get('DATABASE_URL')

        # JWT settings
        self.SECRET_KEY = os.environ.get('SECRET_KEY')
        self.ALGORITHM = os.environ.get('ALGORITHM', 'HS256')
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', '30'))

        # File upload settings
        self.UPLOAD_DIR = os.environ.get('UPLOAD_DIR', 'uploads')
        self.MAX_FILE_SIZE = int(os.environ.get('MAX_FILE_SIZE', '10485760'))  # Default 10MB

        # Gemini API settings
        self.GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

        # Vector Store settings
        self.VECTOR_STORE_COLLECTION = os.environ.get('VECTOR_STORE_COLLECTION', 'HR')
        self.VECTOR_DISTANCE_STRATEGY = os.environ.get('VECTOR_DISTANCE_STRATEGY', 'cosine')

        # Validate required settings
        self._validate_settings()

    def _validate_settings(self):
        required_settings = [
            ('DATABASE_URL', self.DATABASE_URL),
            ('SECRET_KEY', self.SECRET_KEY),
            ('GEMINI_API_KEY', self.GEMINI_API_KEY),
        ]

        for setting_name, setting_value in required_settings:
            if not setting_value:
                raise ValueError(f"{setting_name} must be set in environment variables")

    def dict(self) -> Dict[str, Any]:
        """Return settings as a dictionary"""
        return {
            'DATABASE_URL': self.DATABASE_URL,
            'SECRET_KEY': self.SECRET_KEY,
            'ALGORITHM': self.ALGORITHM,
            'ACCESS_TOKEN_EXPIRE_MINUTES': self.ACCESS_TOKEN_EXPIRE_MINUTES,
            'UPLOAD_DIR': self.UPLOAD_DIR,
            'MAX_FILE_SIZE': self.MAX_FILE_SIZE,
            'GEMINI_API_KEY': self.GEMINI_API_KEY,
            'VECTOR_STORE_COLLECTION': self.VECTOR_STORE_COLLECTION,
            'VECTOR_DISTANCE_STRATEGY': self.VECTOR_DISTANCE_STRATEGY,
        }

# Create a global settings instance
settings = Settings() 