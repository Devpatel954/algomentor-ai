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

// ─── Wandbox (free, no API key, CORS-enabled) ────────────────────────────────
// https://wandbox.org — no signup, no limits for reasonable use
const WANDBOX_URL = 'https://wandbox.org/api';

// Map app language IDs → Wandbox language names (as returned by /api/list.json)
const WANDBOX_LANG = {
  javascript: 'JavaScript',
  python:     'Python',
  java:       'Java',
  cpp:        'C++',
  typescript: 'TypeScript',
  go:         'Go',
};

// Hardcoded fallbacks in case the list endpoint is unavailable
const WANDBOX_FALLBACK = {
  javascript: 'nodejs-head',
  python:     'cpython-head',
  java:       'openjdk-head',
  cpp:        'gcc-head',
  typescript: 'typescript-head',
  go:         'go-head',
};

let _wandboxList = null;
const _compilerCache = {};

async function resolveCompiler(appLang) {
  if (_compilerCache[appLang]) return _compilerCache[appLang];
  try {
    if (!_wandboxList) {
      const r = await fetch(`${WANDBOX_URL}/list.json`);
      if (!r.ok) throw new Error('list failed');
      _wandboxList = await r.json();
    }
    const wbLang  = WANDBOX_LANG[appLang];
    const matches = _wandboxList.filter((c) => c.language === wbLang);
    if (!matches.length) throw new Error('no match');
    // Prefer a rolling "head" build (always latest), else first entry
    const chosen = matches.find((c) => c.name.includes('-head')) || matches[0];
    _compilerCache[appLang] = chosen.name;
    return chosen.name;
  } catch {
    return WANDBOX_FALLBACK[appLang] || 'gcc-head';
  }
}

export const judge0Api = {
  run: async (code, language = 'javascript', stdin = '') => {
    const compiler = await resolveCompiler(language);

    const res = await fetch(`${WANDBOX_URL}/compile.json`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code, compiler, stdin }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Wandbox error: ${res.status}`);
    }

    const data       = await res.json();
    const compileErr = data.compiler_error || null;
    const isSuccess  = data.status === '0' && !compileErr;

    return {
      stdout:         data.program_output || null,
      stderr:         data.program_error  || null,
      compile_output: compileErr,
      status: {
        id:          isSuccess ? 3 : 11,
        description: isSuccess
          ? 'Accepted'
          : compileErr
            ? 'Compilation Error'
            : data.signal
              ? `Killed: ${data.signal}`
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
