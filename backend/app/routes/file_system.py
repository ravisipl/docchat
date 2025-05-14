from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from ..utils.database import get_db
from ..utils.security import get_current_user
from ..utils.document_processor import process_document
from ..models.user import User
from ..models.file_system import Folder, File as DBFile
from ..schemas.file_system import (
    FolderCreate, Folder as FolderResponse, 
    FileCreate, File as FileResponse, 
    FileSystemItem
)
from ..config import settings

router = APIRouter(
    prefix="/files",
    tags=["file-system"]
)

@router.post("/folders", response_model=FolderResponse)
async def create_folder(
    folder: FolderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate parent folder if provided
    if folder.parent_id:
        parent = db.query(Folder).filter(
            Folder.id == folder.parent_id,
            Folder.created_by == current_user.id,
            Folder.is_deleted == False
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent folder not found")

    new_folder = Folder(
        name=folder.name,
        parent_id=folder.parent_id,
        created_by=current_user.id
    )
    db.add(new_folder)
    db.commit()
    db.refresh(new_folder)
    return new_folder

@router.get("/folders/{folder_id}", response_model=FolderResponse)
async def get_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.created_by == current_user.id,
        Folder.is_deleted == False
    ).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder

@router.get("/browse", response_model=List[FileSystemItem])
async def list_items(
    folder_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get folders
    folders_query = db.query(Folder).filter(
        Folder.created_by == current_user.id,
        Folder.is_deleted == False
    )
    if folder_id is not None:
        folders_query = folders_query.filter(Folder.parent_id == folder_id)
    else:
        folders_query = folders_query.filter(Folder.parent_id == None)
    
    folders = folders_query.all()

    # Get files
    files_query = db.query(DBFile).filter(
        DBFile.created_by == current_user.id,
        DBFile.is_deleted == False
    )
    if folder_id is not None:
        files_query = files_query.filter(DBFile.folder_id == folder_id)
    else:
        files_query = files_query.filter(DBFile.folder_id == None)
    
    files = files_query.all()

    # Combine and format results
    items = []
    
    # Add folders
    for folder in folders:
        items.append(FileSystemItem(
            id=folder.id,
            name=folder.name,
            type="folder",
            created_at=folder.created_at,
            updated_at=folder.updated_at,
            parent_id=folder.parent_id
        ))
    
    # Add files
    for file in files:
        items.append(FileSystemItem(
            id=file.id,
            name=file.name,
            type="file",
            created_at=file.created_at,
            updated_at=file.updated_at,
            size=file.size,
            file_type=file.file_type,
            parent_id=file.folder_id
        ))
    
    return items

@router.post("/upload", response_model=FileResponse)
async def upload_file(
    file: UploadFile = File(...),
    folder_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
): 
    # Validate folder if provided
    if folder_id:
        folder = db.query(Folder).filter(
            Folder.id == folder_id,
            Folder.is_deleted == False
        ).first()
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
            
    # Check if file with same name exists in the folder
    existing_file = db.query(DBFile).filter(
        DBFile.name == file.filename,
        DBFile.folder_id == folder_id,
        DBFile.created_by == current_user.id,
        DBFile.is_deleted == False
    ).first()
    
    if existing_file:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"File with name '{file.filename}' already exists in this folder"
        )
            
    # Create base upload directory
    base_upload_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
    os.makedirs(base_upload_dir, exist_ok=True)

    # If folder_id is provided, create folder-specific path
    if folder_id:
        folder_path = []
        current_folder = folder
        while current_folder:
            folder_path.insert(0, str(current_folder.id))
            if current_folder.parent_id:
                current_folder = db.query(Folder).filter(
                    Folder.id == current_folder.parent_id,
                    Folder.created_by == current_user.id,
                    Folder.is_deleted == False
                ).first()
            else:
                current_folder = None
        
        upload_dir = os.path.join(base_upload_dir, *folder_path)
        os.makedirs(upload_dir, exist_ok=True)
    else:
        upload_dir = base_upload_dir

    # Use original filename
    file_path = os.path.join(upload_dir, file.filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Get file size
    file_size = os.path.getsize(file_path)

    # Create file record
    db_file = DBFile(
        name=file.filename,
        original_name=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        size=file_size,
        folder_id=folder_id,
        created_by=current_user.id
    )

    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Process document if it's a text file
    #file_ext = os.path.splitext(file.filename)[1].lower()
    #if file_ext in ['.txt', '.pdf', '.docx']:
    #    try:
    #        await process_document(
    #            file_path=file_path,
    #            file_name=file.filename,
    #            user_id=current_user.id,
    #            db=db
    #        )
    #    except Exception as e:
    #        # Log the error but don't fail the upload
    #        print(f"Error processing document: {str(e)}")
    #else:
    #    print(f"Unsupported file extension: {file_ext}")
    return db_file

@router.delete("/folders/{folder_id}")
async def delete_folder(
    folder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    folder = db.query(Folder).filter(
        Folder.id == folder_id,
        Folder.created_by == current_user.id,
        Folder.is_deleted == False
    ).first()
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Soft delete the folder
    folder.is_deleted = True
    
    # Soft delete all files in the folder
    for file in folder.files:
        file.is_deleted = True
    
    # Recursively soft delete all subfolders and their contents
    def delete_subfolders(folder):
        for subfolder in folder.subfolders:
            if not subfolder.is_deleted:
                subfolder.is_deleted = True
                for file in subfolder.files:
                    file.is_deleted = True
                delete_subfolders(subfolder)
    
    delete_subfolders(folder)
    
    db.commit()
    return {"message": "Folder and its contents deleted successfully"}

@router.delete("/files/{file_id}")
async def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(DBFile).filter(
        DBFile.id == file_id,
        DBFile.created_by == current_user.id,
        DBFile.is_deleted == False
    ).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Soft delete the file
    file.is_deleted = True
    db.commit()
    
    return {"message": "File deleted successfully"} 