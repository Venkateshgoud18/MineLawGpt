"""
MineLawGPT — Agentic RAG using LangGraph StateGraph.

Graph flow:
    START → agent_node → should_continue?
                              ├─ "tools" → tool_node → agent_node (loop)
                              └─ "end"   → END
"""

import json
import os
from typing import Annotated

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, ToolMessage, SystemMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

from services.retriever import retrieve

load_dotenv()



class AgentState(TypedDict):
    """The graph state passed between every node."""
    messages: Annotated[list, add_messages]   # LangGraph merges lists automatically
    sources: list                              # accumulated ChromaDB source metadata


# ---------------------------------------------------------------------------
# Tool definition
# ---------------------------------------------------------------------------

@tool
def search_mining_documents(query: str) -> str:
    """Search the mining law and regulation documents to find relevant information."""
    results = retrieve(query)
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    if not documents:
        return "NO_RESULTS"   # sentinel so tool_node knows to skip sources

    # Attach metadatas as a JSON suffix so tool_node can extract them
    context = "\n\n".join(documents)
    meta_json = json.dumps(metadatas)
    return f"{context}\n\n__METADATAS__{meta_json}"


# ---------------------------------------------------------------------------
# LLM with tools bound
# ---------------------------------------------------------------------------

MODEL = "gpt-4o-mini"

llm = ChatOpenAI(
    model=MODEL,
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0,
)

llm_with_tools = llm.bind_tools([search_mining_documents])

SYSTEM_MESSAGE = SystemMessage(content=(
    "You are MineLawGPT, an intelligent agent capable of researching mining laws and regulations. "
    "You have access to a tool 'search_mining_documents' to search a vector database of documents. "
    "Use it if you need factual information about mining laws. "
    "If you don't need it (e.g., for general greetings), answer directly. "
    "Always base your legal answers on the retrieved documents. "
    "If the retrieved documents do not contain the answer, say so clearly."
))


# ---------------------------------------------------------------------------
# Graph nodes
# ---------------------------------------------------------------------------

def agent_node(state: AgentState) -> dict:
    """Call the LLM. On first call, prepend the system message."""
    messages = state["messages"]

    # Prepend system message if this is the first call (no system msg yet)
    if not any(isinstance(m, SystemMessage) for m in messages):
        messages = [SYSTEM_MESSAGE] + messages

    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}


def tool_node(state: AgentState) -> dict:
    """Execute every tool call requested by the agent and collect sources."""
    last_message = state["messages"][-1]
    tool_messages = []
    new_sources = list(state.get("sources", []))

    for tool_call in last_message.tool_calls:
        if tool_call["name"] == "search_mining_documents":
            # Execute the tool
            raw_result = search_mining_documents.invoke(tool_call["args"])

            # Parse out the metadatas JSON suffix we embedded in the tool output
            if "__METADATAS__" in raw_result:
                context, meta_str = raw_result.split("__METADATAS__", 1)
                try:
                    metadatas = json.loads(meta_str)
                    for meta in metadatas:
                        source = {
                            "document": meta.get("document", "Unknown"),
                            "page": meta.get("page", 0),
                        }
                        if source not in new_sources:
                            new_sources.append(source)
                except json.JSONDecodeError:
                    context = raw_result
            else:
                context = raw_result   # "NO_RESULTS" or plain text

            tool_messages.append(
                ToolMessage(
                    content=context.strip(),
                    tool_call_id=tool_call["id"],
                )
            )

    return {"messages": tool_messages, "sources": new_sources}


# ---------------------------------------------------------------------------
# Conditional edge
# ---------------------------------------------------------------------------

def should_continue(state: AgentState) -> str:
    """Route to 'tools' if the agent issued a tool call, otherwise end."""
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return "end"


# ---------------------------------------------------------------------------
# Build & compile the graph
# ---------------------------------------------------------------------------

_builder = StateGraph(AgentState)

_builder.add_node("agent", agent_node)
_builder.add_node("tools", tool_node)

_builder.add_edge(START, "agent")
_builder.add_conditional_edges(
    "agent",
    should_continue,
    {"tools": "tools", "end": END},
)
_builder.add_edge("tools", "agent")

graph = _builder.compile()


# ---------------------------------------------------------------------------
# Public API (same signature as before — rag.py needs no changes)
# ---------------------------------------------------------------------------

def run_agent(question: str) -> dict:
    """
    Run the LangGraph agentic RAG pipeline.

    Returns:
        {"answer": str, "sources": list[dict]}
    """
    initial_state: AgentState = {
        "messages": [HumanMessage(content=question)],
        "sources": [],
    }

    final_state = graph.invoke(initial_state)

    # The last message is always the agent's final text response
    answer = final_state["messages"][-1].content
    sources = final_state.get("sources", [])

    return {"answer": answer, "sources": sources}
