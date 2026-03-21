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

// ─── Codapi (free public instance, no API key, all major languages) ──────────
// https://codapi.org — sandboxed execution, no signup required
const CODAPI_URL = 'https://codapi.org/api/v1/exec';

// Map app language IDs → Codapi sandbox names
const CODAPI_SANDBOX = {
  javascript: 'javascript',
  python:     'python',
  java:       'java',
  cpp:        'cpp',
  go:         'go',
  typescript: 'javascript', // Codapi has no TS sandbox; run as JS
};

export const judge0Api = {
  run: async (code, language = 'javascript', stdin = '') => {
    const sandbox = CODAPI_SANDBOX[language] || 'python';

    const res = await fetch(CODAPI_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        sandbox,
        command: 'run',
        files:   { '': code },
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Codapi error: ${res.status}`);
    }

    const data      = await res.json();
    // data.ok === false means compile/runtime error
    const isSuccess = data.ok === true && !data.stderr;

    return {
      stdout:         data.stdout  || null,
      stderr:         data.stderr  || null,
      compile_output: data.ok === false && data.stderr ? data.stderr : null,
      status: {
        id:          isSuccess ? 3 : 11,
        description: isSuccess
          ? 'Accepted'
          : data.stderr
            ? 'Error'
            : 'Runtime Error',
      },
      time:   null,
      memory: null,
    };
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
