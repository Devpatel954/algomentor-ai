import logging
from fastapi import APIRouter, HTTPException
from models.schemas import (
    HintRequest, ExplainRequest, ReviewRequest, ProgressRequest, AIResponse,
)
from services.ai_service import get_hint, explain_code, review_code, recommend_progress
from store import PROBLEMS_MAP

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["AI (Mistral)"])


def _ai_error(exc: Exception):
    logger.error("AI endpoint error: %s", exc)
    raise HTTPException(status_code=502, detail=f"AI service error: {exc}")


@router.post("/hint", response_model=AIResponse)
async def hint(body: HintRequest):
    """
    Return step-by-step hints for a problem WITHOUT revealing the solution.
    Use hint_level (1–3) to control how much guidance to give.
    """
    # Prefer fetching description from DB so client can't inject arbitrary text
    problem = PROBLEMS_MAP.get(body.problem_id)
    description = problem.description if problem else body.problem_description

    try:
        result, tokens = await get_hint(description, body.user_code, body.hint_level)
    except RuntimeError as exc:
        _ai_error(exc)

    logger.info("hint | problem_id=%d | tokens=%s", body.problem_id, tokens)
    return AIResponse(result=result, model="mistral-small-latest", tokens_used=tokens)


@router.post("/explain", response_model=AIResponse)
async def explain(body: ExplainRequest):
    """Return a plain-English explanation of the submitted code."""
    try:
        result, tokens = await explain_code(body.user_code, body.language)
    except RuntimeError as exc:
        _ai_error(exc)

    logger.info("explain | lang=%s | tokens=%s", body.language, tokens)
    return AIResponse(result=result, model="mistral-small-latest", tokens_used=tokens)


@router.post("/review", response_model=AIResponse)
async def review(body: ReviewRequest):
    """
    Review the code for time/space complexity and optimization suggestions.
    """
    try:
        result, tokens = await review_code(body.user_code, body.language, body.problem_title or "")
    except RuntimeError as exc:
        _ai_error(exc)

    logger.info("review | lang=%s | tokens=%s", body.language, tokens)
    return AIResponse(result=result, model="mistral-small-latest", tokens_used=tokens)


@router.post("/progress_suggestion", response_model=AIResponse)
async def progress_suggestion(body: ProgressRequest):
    """
    Generate a personalized study plan based on the user's performance data.
    """
    try:
        result, tokens = await recommend_progress(
            body.problems_solved,
            body.accuracy,
            body.weak_topics,
            body.strong_topics,
            body.recent_problems,
        )
    except RuntimeError as exc:
        _ai_error(exc)

    logger.info("progress | solved=%d | tokens=%s", body.problems_solved, tokens)
    return AIResponse(result=result, model="mistral-small-latest", tokens_used=tokens)
