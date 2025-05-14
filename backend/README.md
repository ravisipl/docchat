# DocChat Backend

This is the backend service for the DocChat application, built with FastAPI and PostgreSQL. It provides API endpoints for document processing, chat functionality, and user authentication.

## Features

- Document upload and processing
- Vector-based document search
- Chat interface with AI-powered responses
- User authentication and authorization
- PostgreSQL database with pgvector extension for vector similarity search

## Prerequisites

- Python 3.8 or higher
- PostgreSQL 12 or higher with pgvector extension
- Virtual environment (recommended)

## Installation

1. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. Initialize the database:

```bash
python init_db.py
```

## Project Structure

```
backend/
├── app/                 # Main application code
├── uploads/            # Directory for uploaded documents
├── requirements.txt    # Python dependencies
├── init_db.py         # Database initialization script
└── .env               # Environment variables (create this file)
```

## Running the Application

Start the development server:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access the interactive API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Dependencies

- FastAPI: Web framework
- SQLAlchemy: ORM
- PostgreSQL: Database
- pgvector: Vector similarity search
- LangChain: AI integration
- Google Generative AI: AI model integration
- Python-Jose: JWT authentication
- Passlib: Password hashing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license information here]

python -m pip freeze > packages.txt
python -m pip uninstall -y -r packages.txt
