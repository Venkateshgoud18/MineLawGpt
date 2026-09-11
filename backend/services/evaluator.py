import time
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def _score_with_llm(prompt: str) -> float:
    """Ask the LLM to return a score between 0.0 and 1.0."""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an evaluation assistant. "
                        "Your task is to output ONLY a decimal number between 0.0 and 1.0. "
                        "Do not include any explanation or extra text."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            max_tokens=5,
            temperature=0
        )
        raw = response.choices[0].message.content.strip()
        return round(min(max(float(raw), 0.0), 1.0), 2)
    except Exception:
        return 0.0


def evaluate_response(question: str, answer: str, sources: list) -> dict:
    """
    Evaluate the chat response and return a metrics dict.
    Also prints a formatted matrix to the terminal.
    """
    start = time.time()

    # --- Metric 1: Answer Relevancy ---
    relevancy_prompt = (
        f"Question: {question}\n\n"
        f"Answer: {answer}\n\n"
        "Score how relevant the answer is to the question on a scale from 0.0 (completely irrelevant) "
        "to 1.0 (perfectly relevant). Output only the decimal number."
    )
    relevancy_score = _score_with_llm(relevancy_prompt)

    # --- Metric 2: Faithfulness ---
    if sources:
        source_texts = "\n".join(
            [f"- Document: {s.get('document', 'N/A')}, Page: {s.get('page', 'N/A')}" for s in sources]
        )
        faithfulness_prompt = (
            f"Answer: {answer}\n\n"
            f"Sources used:\n{source_texts}\n\n"
            "Score how faithfully the answer is grounded in the provided sources on a scale from 0.0 "
            "(completely hallucinated) to 1.0 (fully grounded in sources). "
            "Output only the decimal number."
        )
        faithfulness_score = _score_with_llm(faithfulness_prompt)
    else:
        faithfulness_score = 0.5  # Neutral when no sources used (e.g. general greeting)

    # --- Metric 3: Answer Completeness ---
    completeness_prompt = (
        f"Question: {question}\n\n"
        f"Answer: {answer}\n\n"
        "Score how complete and thorough the answer is on a scale from 0.0 (completely incomplete) "
        "to 1.0 (fully complete and thorough). Output only the decimal number."
    )
    completeness_score = _score_with_llm(completeness_prompt)

    eval_time = round(time.time() - start, 2)

    metrics = {
        "relevancy":    relevancy_score,
        "faithfulness": faithfulness_score,
        "completeness": completeness_score,
        "sources_used": len(sources),
        "answer_words": len(answer.split()),
        "eval_time_s":  eval_time,
    }

    _print_matrix(question, answer, metrics)
    return metrics


def _stars(score: float) -> str:
    """Convert 0.0–1.0 score to star rating string."""
    filled = round(score * 5)
    return "★" * filled + "☆" * (5 - filled)


def _bar(score: float, width: int = 20) -> str:
    """Convert 0.0–1.0 score to a progress bar."""
    filled = round(score * width)
    return "█" * filled + "░" * (width - filled)


def _print_matrix(question: str, answer: str, metrics: dict):
    """Print a formatted evaluation matrix to the terminal."""
    W = 62  # total inner width

    def row(label: str, value: str) -> str:
        content = f"  {label:<18} {value}"
        padding = W - len(content)
        return f"║{content}{' ' * max(padding, 0)}║"

    q_display = (question[:45] + "…") if len(question) > 46 else question
    a_words    = metrics["answer_words"]
    sources    = metrics["sources_used"]
    rel        = metrics["relevancy"]
    faith      = metrics["faithfulness"]
    comp       = metrics["completeness"]
    avg        = round((rel + faith + comp) / 3, 2)
    eval_t     = metrics["eval_time_s"]

    print("\n")
    print(f"╔{'═' * W}╗")
    print(f"║{'  📊  RAG EVALUATION MATRIX':^{W}}║")
    print(f"╠{'═' * W}╣")
    print(row("Question:",      q_display))
    print(f"║{'─' * W}║")
    print(row("Answer Length:", f"{a_words} words"))
    print(row("Sources Used:",  f"{sources} document(s)"))
    print(row("Eval Time:",     f"{eval_t}s"))
    print(f"╠{'═' * W}╣")
    print(f"║{'  SCORES':^{W}}║")
    print(f"╠{'═' * W}╣")
    print(row("Relevancy:",     f"{rel:.2f}  {_bar(rel)} {_stars(rel)}"))
    print(row("Faithfulness:",  f"{faith:.2f}  {_bar(faith)} {_stars(faith)}"))
    print(row("Completeness:",  f"{comp:.2f}  {_bar(comp)} {_stars(comp)}"))
    print(f"╠{'═' * W}╣")
    print(row("Overall Score:", f"{avg:.2f}  {_bar(avg)} {_stars(avg)}"))
    print(f"╚{'═' * W}╝")
    print()
