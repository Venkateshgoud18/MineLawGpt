from services.agent import run_agent, stream_agent


def ask_question(question: str):
    # Delegate the process to our intelligent Agent
    return run_agent(question)


def stream_question(question: str):
    # Delegate streaming process to our intelligent Agent
    return stream_agent(question)