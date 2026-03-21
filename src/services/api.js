/**
 * API service layer — all HTTP calls to the AlgoMentor backend.
 *
 * Base URL is read from VITE_API_URL (set in .env), falling back to
 * localhost:8000 for local development.
 *
 * TODO (scalability): Wrap with React Query or SWR for caching,
 * deduplication, and automatic retries on the client side.
 */
const BASE_URL = (import.meta.env.VITE_API_URL || 'https://algomentor-ai.onrender.com').replace(/\/$/, '');

// ─── Base fetch ───────────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }

  return res.json();
}

// ─── Problems ─────────────────────────────────────────────────────────────────
// NOTE: Frontend currently uses local dummy data (src/data/dummy.js).
// Switch to these calls once the backend is backed by a real database.
export const problemsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/problems${qs ? `?${qs}` : ''}`);
  },
  get: (id) => request(`/problems/${id}`),
};

// ─── Submissions ──────────────────────────────────────────────────────────────
export const submissionsApi = {
  submit: (problem_id, code, language = 'javascript') =>
    request('/submissions', {
      method: 'POST',
      body: JSON.stringify({ problem_id, code, language }),
    }),

  mySubmissions: () => request('/submissions/me'),
};

// ─── Judge0 (real code execution) ────────────────────────────────────────────
// Add VITE_JUDGE0_API_KEY to .env (free tier at rapidapi.com/judge0-official/api/judge0-ce)
// Without a key, Run falls back to a simulated response.
export const judge0Api = {
  LANG_IDS: {
    javascript: 63,  // Node.js 12.14.0
    python: 71,      // Python 3.8.1
    java: 62,        // OpenJDK 13
    cpp: 54,         // GCC 9.2.0
    typescript: 74,  // TypeScript 3.7.4
    go: 60,          // Go 1.13.5
  },

  run: async (code, language = 'javascript', stdin = '') => {
    const apiKey = import.meta.env.VITE_JUDGE0_API_KEY;

    if (!apiKey) {
      // Graceful mock when no key configured
      await new Promise((r) => setTimeout(r, 1400));
      return {
        stdout: '// ⚠️ No Judge0 API key set.\n// Add VITE_JUDGE0_API_KEY=your_key to .env\n// Get a free key at rapidapi.com/judge0-official/api/judge0-ce\n// Your code runs locally — add console.log() to see output.',
        stderr: null,
        status: { id: 3, description: 'Simulated Run' },
        time: '0.05',
        memory: 3200,
      };
    }

    const langId = judge0Api.LANG_IDS[language] || 63;
    const res = await fetch(
      'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        body: JSON.stringify({ source_code: code, language_id: langId, stdin }),
      }
    );
    if (!res.ok) throw new Error(`Judge0 error: ${res.status}`);
    return res.json();
  },
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiApi = {
  hint: (problem_id, problem_description, user_code, hint_level = 1) =>
    request('/ai/hint', {
      method: 'POST',
      body: JSON.stringify({ problem_id, problem_description, user_code, hint_level }),
    }),

  explain: (user_code, language = 'javascript') =>
    request('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ user_code, language }),
    }),

  review: (user_code, language = 'javascript', problem_title = '') =>
    request('/ai/review', {
      method: 'POST',
      body: JSON.stringify({ user_code, language, problem_title }),
    }),

  progressSuggestion: ({ problems_solved, accuracy, weak_topics, strong_topics, recent_problems }) =>
    request('/ai/progress_suggestion', {
      method: 'POST',
      body: JSON.stringify({ problems_solved, accuracy, weak_topics, strong_topics, recent_problems }),
    }),
};
