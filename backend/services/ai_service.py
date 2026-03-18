import asyncio
import logging
from mistralai.client import Mistral
from config import settings

logger = logging.getLogger(__name__)

MISTRAL_MODEL = "mistral-small-latest"
_MAX_RETRIES = 3
_RETRY_DELAY = 1.0  # seconds; doubles on each attempt (exponential backoff)


def _client() -> Mistral:
    """Create a Mistral client using the configured API key."""
    return Mistral(api_key=settings.MISTRAL_API_KEY)


def _extract_text(response) -> tuple[str, int | None]:
    """Extract text content and token count from a Mistral response object."""
    content = response.choices[0].message.content or ""
    tokens = getattr(response.usage, "total_tokens", None)
    return content.strip(), tokens


async def _call_mistral(
    messages: list[dict],
    max_tokens: int,
    temperature: float,
) -> tuple[str, int | None]:
    """
    Invoke the Mistral chat API with exponential-backoff retry.

    Retries up to _MAX_RETRIES times on any transient error, then raises
    RuntimeError. All attempts are logged for observability.

    TODO (scalability): Share a single httpx.AsyncClient across requests
    and add Redis-based prompt caching to reduce repeat API costs.
    """
    last_exc: Exception | None = None
    for attempt in range(1, _MAX_RETRIES + 1):
        try:
            response = await _client().chat.complete_async(
                model=MISTRAL_MODEL,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            return _extract_text(response)
        except Exception as exc:
            last_exc = exc
            if attempt < _MAX_RETRIES:
                wait = _RETRY_DELAY * (2 ** (attempt - 1))
                logger.warning(
                    "Mistral call failed (attempt %d/%d): %s — retrying in %.1fs",
                    attempt, _MAX_RETRIES, exc, wait,
                )
                await asyncio.sleep(wait)
            else:
                logger.error("Mistral call failed after %d attempts: %s", _MAX_RETRIES, exc)
    raise RuntimeError(
        f"Mistral API error after {_MAX_RETRIES} retries: {last_exc}"
    ) from last_exc


# ─── Hint ────────────────────────────────────────────────────────────────────

async def get_hint(problem_description: str, user_code: str, hint_level: int = 1) -> tuple[str, int]:
    """
    Return a step-by-step hint WITHOUT revealing the full solution.
    hint_level: 1 = nudge, 2 = approach, 3 = near-solution
    """
    nudge_map = {
        1: "Give only a very gentle nudge — point them in the right direction without revealing any steps.",
        2: "Explain the general approach and algorithm they should use, but do not write code.",
        3: "Give a near-complete walkthrough of the strategy, still without writing the actual solution code.",
    }
    level_instruction = nudge_map.get(hint_level, nudge_map[1])

    system = (
        "You are an expert coding mentor for algorithm practice. "
        "Your job is to guide users with hints — NEVER provide the complete solution or working code. "
        "Be encouraging, concise, and educational. Format responses with clear steps using markdown."
    )
    user_msg = (
        f"Problem:\n{problem_description}\n\n"
        f"User's current code:\n```\n{user_code}\n```\n\n"
        f"Hint level {hint_level}: {level_instruction}"
    )

    logger.info("AI hint | level=%d | code_len=%d", hint_level, len(user_code))
    return await _call_mistral(
        [{"role": "system", "content": system}, {"role": "user", "content": user_msg}],
        max_tokens=600,
        temperature=0.4,
    )


# ─── Explain Code ─────────────────────────────────────────────────────────────

async def explain_code(user_code: str, language: str = "javascript") -> tuple[str, int]:
    """Return a human-readable, line-by-line explanation of the user's code."""
    system = (
        "You are an expert programming educator. Explain code clearly for intermediate developers. "
        "Break it down logically: what each block does, why, and any important concepts used. "
        "Use markdown with bold labels for sections."
    )
    user_msg = (
        f"Please explain this {language} code clearly:\n\n```{language}\n{user_code}\n```"
    )

    logger.info("AI explain | lang=%s | code_len=%d", language, len(user_code))
    return await _call_mistral(
        [{"role": "system", "content": system}, {"role": "user", "content": user_msg}],
        max_tokens=800,
        temperature=0.3,
    )


# ─── Code Review ──────────────────────────────────────────────────────────────

async def review_code(user_code: str, language: str = "javascript", problem_title: str = "") -> tuple[str, int]:
    """
    Review the user's code for:
    - Time complexity
    - Space complexity
    - Correctness issues
    - Optimization suggestions
    """
    context = f" for the problem '{problem_title}'" if problem_title else ""
    system = (
        "You are a senior software engineer conducting a code review for a competitive programming solution. "
        "Analyze the code and provide: "
        "1. Time complexity (Big-O), "
        "2. Space complexity (Big-O), "
        "3. Correctness issues or edge cases missed, "
        "4. Concrete optimization suggestions. "
        "Be precise and technical. Use markdown formatting."
    )
    user_msg = (
        f"Review this {language} solution{context}:\n\n```{language}\n{user_code}\n```"
    )

    logger.info("AI review | lang=%s | problem=%s", language, problem_title)
    return await _call_mistral(
        [{"role": "system", "content": system}, {"role": "user", "content": user_msg}],
        max_tokens=800,
        temperature=0.2,
    )


# ─── Progress Suggestions ─────────────────────────────────────────────────────

async def recommend_progress(
    problems_solved: int,
    accuracy: float,
    weak_topics: list[str],
    strong_topics: list[str],
    recent_problems: list[str],
) -> tuple[str, int]:
    """Generate personalized study recommendations based on user performance."""
    system = (
        "You are an expert algorithm coach creating personalized study plans. "
        "Based on the user's stats, recommend: "
        "1. Specific topics to focus on (with reasoning), "
        "2. Problem difficulty progression, "
        "3. 3–5 specific problem types to practice next, "
        "4. A motivating message. "
        "Keep it actionable and concise. Use markdown."
    )
    user_msg = (
        f"User stats:\n"
        f"- Problems solved: {problems_solved}\n"
        f"- Overall accuracy: {accuracy:.1f}%\n"
        f"- Weak areas: {', '.join(weak_topics) or 'None identified'}\n"
        f"- Strong areas: {', '.join(strong_topics) or 'None identified'}\n"
        f"- Recent problems attempted: {', '.join(recent_problems) or 'None'}\n\n"
        f"Create a personalized study plan for this user."
    )

    logger.info(
        "AI progress | solved=%d | accuracy=%.1f | weak=%s",
        problems_solved, accuracy, weak_topics,
    )
    return await _call_mistral(
        [{"role": "system", "content": system}, {"role": "user", "content": user_msg}],
        max_tokens=700,
        temperature=0.5,
    )
