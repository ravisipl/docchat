from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FolderBase(BaseModel):
    name: str
    parent_id: Optional[int] = None

class FolderCreate(FolderBase):
    pass

class FolderUpdate(FolderBase):
    name: Optional[str] = None

class FileBase(BaseModel):
    name: str
    original_name: str
    file_type: Optional[str] = None
    size: Optional[int] = None
    folder_id: Optional[int] = None

class FileCreate(FileBase):
    file_path: str

class FileUpdate(FileBase):
    name: Optional[str] = None
    original_name: Optional[str] = None

class File(FileBase):
    id: int
    file_path: str
    created_by: int
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    class Config:
        from_attributes = True

class Folder(FolderBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    files: List[File] = []
    subfolders: List['Folder'] = []

    class Config:
        from_attributes = True

# Update Folder's forward reference
Folder.model_rebuild()

class FileSystemItem(BaseModel):
    id: int
    name: str
    type: str  # 'file' or 'folder'
    created_at: datetime
    updated_at: datetime
    parent_id: Optional[int] = None
    size: Optional[int] = None
    file_type: Optional[str] = None

    class Config:
        from_attributes = True 