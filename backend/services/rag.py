from services.agent import run_agent


def ask_question(question: str):
    # Delegate the process to our intelligent Agent
    return run_agent(question)