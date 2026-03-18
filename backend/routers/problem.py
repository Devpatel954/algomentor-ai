"""
Problem listing and detail endpoints.

TODO (scalability): Replace in-memory PROBLEMS / PROBLEMS_MAP with
async database queries (e.g. SQLAlchemy + asyncpg) to support a
dynamic, admin-managed problem set.
"""
from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Problem
from store import PROBLEMS, PROBLEMS_MAP

router = APIRouter(prefix="/problems", tags=["Problems"])


@router.get("", response_model=List[Problem])
async def list_problems(
    difficulty: str | None = None,
    tag: str | None = None,
) -> List[Problem]:
    """Return all problems, optionally filtered by difficulty or tag."""
    result = PROBLEMS
    if difficulty:
        result = [p for p in result if p.difficulty.lower() == difficulty.lower()]
    if tag:
        result = [p for p in result if tag.lower() in [t.lower() for t in p.tags]]
    return result


@router.get("/{problem_id}", response_model=Problem)
async def get_problem(problem_id: int) -> Problem:
    """Return a single problem by ID."""
    problem = PROBLEMS_MAP.get(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem
