from fastapi import APIRouter, UploadFile, File
import os
import shutil

from services.indexer import index_document

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    path = os.path.join(UPLOAD_DIR, file.filename)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = index_document(path, file.filename)
    except Exception as e:
        # Clean up file on failure
        os.remove(path)
        return {"error": str(e)}

    return {
        "message": "File uploaded successfully",
        **result
    }