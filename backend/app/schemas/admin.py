from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class AdminUserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: bool = True
    is_superuser: bool = False

class AdminUserCreate(AdminUserBase):
    password: str

class AdminUserUpdate(AdminUserBase):
    password: Optional[str] = None

class AdminUserInDB(AdminUserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AdminDocumentBase(BaseModel):
    title: str
    file_path: str
    file_type: str

class AdminDocumentCreate(AdminDocumentBase):
    uploaded_by: int

class AdminDocumentInDB(AdminDocumentBase):
    id: int
    uploaded_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 