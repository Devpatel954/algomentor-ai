"""
Pydantic models for all API request/response payloads.

TODO (scalability): Replace with SQLModel or SQLAlchemy models when
adding a real database layer.
"""
from pydantic import BaseModel
from typing import Optional, List


# ─── Problem ─────────────────────────────────────────────────────────────────

class TestCase(BaseModel):
    input: str
    expected_output: str


class Problem(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    tags: List[str]
    starter_code: str
    optimal_solution: str
    test_cases: List[TestCase]


# ─── Submission ───────────────────────────────────────────────────────────────

class SubmitRequest(BaseModel):
    problem_id: int
    code: str
    language: str = "javascript"


class SubmitResponse(BaseModel):
    submission_id: str
    status: str          # "Accepted" | "Wrong Answer" | "Runtime Error"
    passed_tests: int
    total_tests: int
    runtime_ms: int
    memory_mb: float
    message: str


# ─── AI ──────────────────────────────────────────────────────────────────────

class HintRequest(BaseModel):
    problem_id: int
    problem_description: str
    user_code: str
    hint_level: int = 1   # 1 = gentle nudge, 2 = more detail, 3 = near-solution


class ExplainRequest(BaseModel):
    user_code: str
    language: str = "javascript"


class ReviewRequest(BaseModel):
    user_code: str
    language: str = "javascript"
    problem_title: Optional[str] = None


class ProgressRequest(BaseModel):
    problems_solved: int
    accuracy: float
    weak_topics: List[str]
    strong_topics: List[str]
    recent_problems: List[str]


class AIResponse(BaseModel):
    result: str
    model: str
    tokens_used: Optional[int] = None
