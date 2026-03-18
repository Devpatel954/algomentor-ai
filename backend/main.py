import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import problem, submission, ai
from config import settings

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AlgoMentor AI",
    description=(
        "AI-powered algorithm practice platform backend. "
        "Powered by Mistral AI for hints, explanations, code review, and personalized recommendations."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
# TODO (scalability): Add Redis rate-limiting middleware on /ai/* to control Mistral API costs.
app.include_router(problem.router)
app.include_router(submission.router)
app.include_router(ai.router)


# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "AlgoMentor AI Backend"}


@app.on_event("startup")
async def on_startup():
    logger.info("AlgoMentor AI backend started — docs at http://localhost:8000/docs")
