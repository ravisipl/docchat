from pydantic import BaseModel, EmailStr, Field, constr
from typing import Optional
from datetime import datetime
import re

# Email regex pattern
email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

class UserBase(BaseModel):
    username: constr(min_length=3, max_length=50)
    email: str = Field(..., pattern=email_regex)
    is_active: bool = True

class UserCreate(UserBase):
    password: constr(min_length=6)
    is_admin: bool = False

class UserUpdate(BaseModel):
    username: Optional[constr(min_length=3, max_length=50)] = None
    email: Optional[str] = Field(None, pattern=email_regex)
    password: Optional[constr(min_length=6)] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True 