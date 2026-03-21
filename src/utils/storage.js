// ─── Keys ─────────────────────────────────────────────────────────────────────
const BOOKMARKS_KEY = 'algomentor_bookmarks';
const NOTES_KEY     = 'algomentor_notes';
const SOLVED_KEY    = 'algomentor_solved';
const REVIEW_KEY    = 'algomentor_review';
const DAILY_KEY     = 'algomentor_daily';

// ─── Bookmarks ────────────────────────────────────────────────────────────────
export const bookmarksStorage = {
  get: () => JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'),
  toggle: (id) => {
    const curr = bookmarksStorage.get();
    const updated = curr.includes(id)
      ? curr.filter((x) => x !== id)
      : [...curr, id];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return updated;
  },
  isBookmarked: (id) => bookmarksStorage.get().includes(id),
};

// ─── Notes (per problem, auto-saved) ─────────────────────────────────────────
export const notesStorage = {
  get: (problemId) => localStorage.getItem(`${NOTES_KEY}_${problemId}`) || '',
  set: (problemId, note) =>
    localStorage.setItem(`${NOTES_KEY}_${problemId}`, note),
};

// ─── Solved problems (tracks date solved) ────────────────────────────────────
export const solvedStorage = {
  getAll: () => JSON.parse(localStorage.getItem(SOLVED_KEY) || '{}'),
  markSolved: (problemId) => {
    const curr = solvedStorage.getAll();
    if (!curr[problemId]) {
      curr[problemId] = new Date().toISOString().split('T')[0];
      localStorage.setItem(SOLVED_KEY, JSON.stringify(curr));
    }
  },
  getSolvedIds: () => Object.keys(solvedStorage.getAll()).map(Number),
  getDateMap: () => solvedStorage.getAll(),
};

// ─── Spaced Repetition (simplified SM-2 algorithm) ───────────────────────────
export const reviewStorage = {
  get: () => JSON.parse(localStorage.getItem(REVIEW_KEY) || '{}'),

  // quality: 0-5 (0=blackout, 3=correct-with-effort, 5=perfect)
  schedule: (problemId, quality = 3) => {
    const curr = reviewStorage.get();
    const entry = curr[problemId] || { interval: 1, ease: 2.5, reps: 0 };
    let { interval, ease, reps } = entry;

    if (quality >= 3) {
      interval =
        reps === 0 ? 1 : reps === 1 ? 3 : Math.round(interval * ease);
      ease = Math.max(1.3, ease + 0.1 - (5 - quality) * 0.08);
      reps += 1;
    } else {
      reps = 0;
      interval = 1;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    curr[problemId] = {
      interval,
      ease,
      reps,
      nextReview: nextDate.toISOString().split('T')[0],
    };
    localStorage.setItem(REVIEW_KEY, JSON.stringify(curr));
    return curr[problemId];
  },

  getDue: () => {
    const data = reviewStorage.get();
    const today = new Date().toISOString().split('T')[0];
    return Object.entries(data)
      .filter(([, v]) => v.nextReview <= today)
      .map(([id]) => Number(id));
  },

  getNextReview: (problemId) =>
    reviewStorage.get()[problemId]?.nextReview || null,
};

// ─── Daily Challenge ──────────────────────────────────────────────────────────
export const dailyStorage = {
  hasCompletedToday: () => {
    const stored = localStorage.getItem(DAILY_KEY);
    if (!stored) return false;
    return JSON.parse(stored).date === new Date().toISOString().split('T')[0];
  },
  markCompleted: (problemId) => {
    localStorage.setItem(
      DAILY_KEY,
      JSON.stringify({ date: new Date().toISOString().split('T')[0], problemId })
    );
  },
};

// ─── Heatmap (generate 365-day activity data, merges with real solved dates) ──
export function generateHeatmapData() {
  // Deterministic mock baseline using LCG PRNG
  let seed = 12345;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  const result = {};
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const r = rand();
    const recentBoost = i < 14 ? 0.28 : i < 30 ? 0.12 : 0;
    result[key] = r < 0.3 + recentBoost ? Math.floor(rand() * 4) + 1 : 0;
  }

  // Overlay real localStorage solved dates
  const realSolved = solvedStorage.getDateMap();
  Object.keys(realSolved).forEach((date) => {
    if (result[date] !== undefined) {
      result[date] = Math.max(result[date], 1);
    }
  });

  return result;
}
