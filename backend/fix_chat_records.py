"""
One-time migration: fix chat records where `answer` was stored as an object
instead of a plain string. Run once with: python fix_chat_records.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI

async def fix():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_database("minelawgpt")
    col = db["chats"]

    # Find all records where answer is a dict (object)
    bad_docs = []
    async for doc in col.find({}):
        if isinstance(doc.get("answer"), dict):
            bad_docs.append(doc)

    print(f"Found {len(bad_docs)} bad record(s) to fix.")

    for doc in bad_docs:
        ans_obj = doc["answer"]
        fixed_answer = ans_obj.get("answer", str(ans_obj))
        fixed_sources = ans_obj.get("sources", doc.get("sources", []))
        await col.update_one(
            {"_id": doc["_id"]},
            {"$set": {"answer": fixed_answer, "sources": fixed_sources}}
        )
        print(f"  Fixed _id={doc['_id']}")

    print("Done.")
    client.close()

asyncio.run(fix())
