# AlgoMentor AI 🧠

An AI-powered coding mentor that helps developers master Data Structures & Algorithms — not by giving answers, but by guiding you to find them yourself.

## 🚀 Live Demo

| | Link |
|-|------|
| 🌐 **Frontend** | [algomentor-ai.vercel.app](https://algomentor-ai.vercel.app) |
| ⚙️ **Backend API** | [algomentor-ai.onrender.com](https://algomentor-ai.onrender.com) |
| 📖 **Swagger Docs** | [algomentor-ai.onrender.com/docs](https://algomentor-ai.onrender.com/docs) |

## What is this?

Most DSA learners hit a wall, give up, and look at the solution — learning nothing. AlgoMentor fixes that by putting a Mistral AI assistant right beside every coding problem. It nudges you in the right direction without spoiling the answer.

## What it does

- **Progressive Hints** — Ask for a hint up to 3 times. Each level gets a little more specific, but never reveals the full solution
- **Code Explanation** — Paste your current attempt and get a plain-English, line-by-line breakdown
- **Code Review** — Get feedback like a senior engineer would give: time complexity, edge cases, style issues
- **Progress Dashboard** — Track accuracy, solved problems, and weak topics with charts. The AI then recommends exactly what to practice next
- **10 DSA Problems** — Two Sum, Binary Search, Linked List cycle detection, BST validation, Graph BFS, and more

## Tech Stack

- **Frontend** — React 18, Vite, Tailwind CSS, React Router, Recharts
- **Backend** — FastAPI, Python, Pydantic v2
- **AI** — Mistral AI (`mistral-small-latest`) with exponential-backoff retry

## Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
# Add MISTRAL_API_KEY to backend/.env
python -m uvicorn main:app --port 8000 --reload

# Frontend (new terminal)
npm install
npm run dev
```

Open http://localhost:5173

## API Docs

Auto-generated Swagger UI available at http://localhost:8000/docs

## License

MIT
