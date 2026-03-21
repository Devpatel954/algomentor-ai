import subprocess
import tempfile
import os
import logging
from fastapi import APIRouter
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/run", tags=["Code Execution"])


class RunRequest(BaseModel):
    code: str
    language: str
    stdin: str = ""


# Languages the backend can execute (Python3 is always available on Render;
# node may or may not be — we try it and fall back gracefully).
LANG_CONFIG = {
    "python": {"cmd": ["python3"], "ext": "py"},
    "javascript": {"cmd": ["node"], "ext": "js"},
}


@router.post("")
async def run_code(req: RunRequest):
    lang = req.language.lower()
    cfg = LANG_CONFIG.get(lang)

    if not cfg:
        return {
            "stdout": None,
            "stderr": f"Server-side execution for '{lang}' is not available. Use Python or JavaScript.",
            "compile_output": None,
            "status": {"id": 11, "description": "Unsupported Language"},
            "time": None,
            "memory": None,
        }

    # Write code to a temp file
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=f".{cfg['ext']}", delete=False, encoding="utf-8"
        ) as f:
            f.write(req.code)
            tmp_path = f.name

        result = subprocess.run(
            cfg["cmd"] + [tmp_path],
            input=req.stdin,
            capture_output=True,
            text=True,
            timeout=10,  # 10-second hard limit
        )
        os.unlink(tmp_path)

        is_success = result.returncode == 0 and not result.stderr
        return {
            "stdout": result.stdout or None,
            "stderr": result.stderr or None,
            "compile_output": None,
            "status": {
                "id": 3 if is_success else 11,
                "description": "Accepted" if is_success else "Runtime Error",
            },
            "time": None,
            "memory": None,
        }

    except subprocess.TimeoutExpired:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
        return {
            "stdout": None,
            "stderr": "Time Limit Exceeded (10s)",
            "compile_output": None,
            "status": {"id": 5, "description": "Time Limit Exceeded"},
            "time": None,
            "memory": None,
        }
    except FileNotFoundError:
        # e.g. `node` not installed on the server
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
        return {
            "stdout": None,
            "stderr": f"Runtime for '{lang}' is not installed on the server. Try Python instead.",
            "compile_output": None,
            "status": {"id": 11, "description": "Runtime Unavailable"},
            "time": None,
            "memory": None,
        }
    except Exception as e:
        logger.error("run_code error: %s", e)
        return {
            "stdout": None,
            "stderr": str(e),
            "compile_output": None,
            "status": {"id": 11, "description": "Internal Error"},
            "time": None,
            "memory": None,
        }
