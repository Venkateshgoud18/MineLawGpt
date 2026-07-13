from fastapi import APIRouter, UploadFile, File
import os
import shutil

from services.indexer import index_pdf

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/")
async def upload_pdf(file: UploadFile = File(...)):
    path = os.path.join(UPLOAD_DIR, file.filename)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = index_pdf(path, file.filename)

    return {
        "message": "PDF uploaded successfully",
        **result
    }