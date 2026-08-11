import json
from typing import List, Dict, Any
from openai import OpenAI
from dotenv import load_dotenv
import os
from services.retriever import retrieve

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = "gpt-4o-mini"

# Define the tools available to the agent
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_mining_documents",
            "description": "Search the mining law and regulation documents to find relevant information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query to look up in the vector database."
                    }
                },
                "required": ["query"]
            }
        }
    }
]

def run_agent(question: str):
    messages = [
        {
            "role": "system", 
            "content": "You are MineLawGPT, an intelligent agent capable of researching mining laws and regulations. You have access to a tool 'search_mining_documents' to search a vector database of documents. Use it if you need factual information about mining laws. If you don't need it (e.g., for general greetings), answer directly. Always base your legal answers on the retrieved documents. If the retrieved documents do not contain the answer, say so."
        },
        {"role": "user", "content": question}
    ]

    all_sources = []
    max_steps = 5
    
    for _ in range(max_steps):
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=tools
        )
        
        response_message = response.choices[0].message
        
        # If the model wants to call a tool
        if response_message.tool_calls:
            # We must append the model's message with the tool calls
            messages.append(response_message)
            
            for tool_call in response_message.tool_calls:
                if tool_call.function.name == "search_mining_documents":
                    args = json.loads(tool_call.function.arguments)
                    query = args.get("query", question)
                    
                    # Execute retrieval tool
                    results = retrieve(query)
                    documents = results.get("documents", [[]])[0]
                    metadatas = results.get("metadatas", [[]])[0]
                    
                    if not documents:
                        tool_result = "No matching documents found in the database."
                    else:
                        tool_result = "\n\n".join(documents)
                        
                        # Accumulate sources without duplicates
                        for meta in metadatas:
                            source = {
                                "document": meta.get("document", "Unknown"),
                                "page": meta.get("page", 0)
                            }
                            if source not in all_sources:
                                all_sources.append(source)
                    
                    # Append tool result to messages
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": tool_call.function.name,
                        "content": tool_result
                    })
        else:
            # Model generated a final text answer
            return {
                "answer": response_message.content,
                "sources": all_sources
            }
            
    return {
        "answer": "I have reached the maximum number of reasoning steps without a final answer.",
        "sources": all_sources
    }
