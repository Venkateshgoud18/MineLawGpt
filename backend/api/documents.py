from fastapi import APIRouter
from fastapi.responses import FileResponse
import os

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)

LAWS_FILE_PATH = "data/mining_laws.txt"

os.makedirs("data", exist_ok=True)
if not os.path.exists(LAWS_FILE_PATH):
    with open(LAWS_FILE_PATH, "w") as f:
        f.write("""# Comprehensive Mining Laws & Regulations

1. The Mines Act, 1952
An Act to amend and consolidate the law relating to the regulation of labour and safety in mines.

2. The Mines and Minerals (Development and Regulation) Act, 1957
An Act to provide for the development and regulation of mines and minerals.

3. Coal Mines Regulations, 2017
Regulations for ensuring safety, health, and proper working conditions in coal mines.

4. Metalliferous Mines Regulations, 1961
Safety and operational guidelines for metalliferous mines.

5. Environment Protection Act, 1986 (Mining Context)
Guidelines and compliance requirements for environmental clearances, waste disposal, and pollution control in mining areas.
""")

@router.get("/laws")
async def get_mining_laws():
    """Returns a document containing all mining laws."""
    return FileResponse(
        path=LAWS_FILE_PATH, 
        filename="mining_laws.txt", 
        media_type="text/plain"
    )
