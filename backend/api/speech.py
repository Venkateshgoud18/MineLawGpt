from fastapi import APIRouter, HTTPException, UploadFile, File
from openai import OpenAI
import os
import tempfile
import shutil
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

router = APIRouter(
    prefix="/speech",
    tags=["Speech"]
)

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Save the uploaded file to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            shutil.copyfileobj(file.file, temp_audio)
            temp_file_path = temp_audio.name

        with open(temp_file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        
        # Clean up
        os.remove(temp_file_path)
        
        return {"text": transcript.text}
    except Exception as e:
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))
