import uuid
import random
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import SubmitRequest, SubmitResponse
from store import submissions_db, PROBLEMS_MAP

router = APIRouter(prefix="/submissions", tags=["Submissions"])


def _mock_execute(code: str, problem_id: int) -> dict:
    """
    Mock code execution.
    In production, replace with a sandboxed code runner (e.g. Judge0 API).
    """
    problem = PROBLEMS_MAP.get(problem_id)
    total_tests = len(problem.test_cases) if problem else 3

    # 70% chance of passing if code is non-trivial (> starter length)
    is_attempting = len(code.strip()) > 60
    passed = total_tests if (is_attempting and random.random() < 0.7) else random.randint(0, total_tests - 1)
    status = "Accepted" if passed == total_tests else (
        "Wrong Answer" if passed > 0 else "Runtime Error"
    )

    return {
        "status": status,
        "passed_tests": passed,
        "total_tests": total_tests,
        "runtime_ms": random.randint(40, 210),
        "memory_mb": round(random.uniform(38.0, 55.0), 1),
    }


@router.post("", response_model=SubmitResponse, status_code=201)
async def submit(body: SubmitRequest):
    if body.problem_id not in PROBLEMS_MAP:
        raise HTTPException(status_code=404, detail="Problem not found")

    result = _mock_execute(body.code, body.problem_id)
    submission_id = str(uuid.uuid4())

    record = {
        "submission_id": submission_id,
        "username": "anonymous",
        "problem_id": body.problem_id,
        "language": body.language,
        "code": body.code,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        **result,
    }
    submissions_db.append(record)

    message = (
        f"All {result['total_tests']} test cases passed!"
        if result["status"] == "Accepted"
        else f"Passed {result['passed_tests']}/{result['total_tests']} test cases."
    )

    return SubmitResponse(submission_id=submission_id, message=message, **result)


@router.get("/me", response_model=List[dict])
async def my_submissions():
    """Return all submission history."""
    user_subs = [
        {k: v for k, v in s.items() if k != "code"}  # omit code for brevity
        for s in submissions_db
    ]
    return sorted(user_subs, key=lambda s: s["submitted_at"], reverse=True)
