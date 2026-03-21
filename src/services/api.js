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

// ─── Piston (free, no API key, 70+ languages) ────────────────────────────────
// https://github.com/engineer-man/piston — completely free, no rate-limit for reasonable use
export const judge0Api = {
  // Piston language names (version "*" = latest available)
  LANG_NAMES: {
    javascript: 'javascript',
    python:     'python',
    java:       'java',
    cpp:        'c++',
    typescript: 'typescript',
    go:         'go',
  },

  run: async (code, language = 'javascript', stdin = '') => {
    const langName = judge0Api.LANG_NAMES[language] || 'javascript';

    const res = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: langName,
        version: '*',
        files: [{ content: code }],
        stdin,
      }),
    });

    if (!res.ok) throw new Error(`Piston error: ${res.status}`);
    const data = await res.json();

    const run = data.run || {};
    const compileErr = data.compile?.stderr || data.compile?.output || null;

    // Did execution succeed? (exit code 0 and no stderr)
    const isSuccess = run.code === 0 && !run.stderr;

    // Normalize to the same shape the rest of the app expects (Judge0-compatible)
    return {
      stdout:          run.stdout || null,
      stderr:          run.stderr || null,
      compile_output:  compileErr,
      status: {
        id:          isSuccess ? 3 : 11,
        description: isSuccess
          ? 'Accepted'
          : compileErr
            ? 'Compilation Error'
            : run.signal
              ? `Killed: ${run.signal}`
              : 'Runtime Error',
      },
      time:   null,  // Piston doesn't expose timing
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
