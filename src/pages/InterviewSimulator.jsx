import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Building2, Play, RotateCcw, CheckCircle2, XCircle, ChevronRight, Send, Code2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CodeEditor from '../components/ui/CodeEditor';
import { problems } from '../data/dummy';

const COMPANIES = [
  { id: 'google', name: 'Google', emoji: '🔵', color: 'border-blue-200 bg-blue-50 text-blue-700', tags: ['Array', 'Graph', 'DP'] },
  { id: 'meta', name: 'Meta', emoji: '🟣', color: 'border-violet-200 bg-violet-50 text-violet-700', tags: ['Tree', 'Graph', 'String'] },
  { id: 'amazon', name: 'Amazon', emoji: '🟠', color: 'border-amber-200 bg-amber-50 text-amber-700', tags: ['Array', 'Tree', 'DP'] },
  { id: 'apple', name: 'Apple', emoji: '⚪', color: 'border-slate-200 bg-slate-50 text-slate-700', tags: ['Array', 'String', 'Graph'] },
];

const DURATIONS = [
  { label: '30 min', value: 30, desc: 'Easy problems' },
  { label: '45 min', value: 45, desc: 'Standard interview' },
  { label: '60 min', value: 60, desc: 'Hard problems' },
];

function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function pickProblem(company) {
  const companyProblems = problems.filter((p) =>
    p.company?.some((c) => c.toLowerCase() === company.id)
  );
  const pool = companyProblems.length > 0 ? companyProblems : problems;
  const seed = new Date().getDate() + company.id.length;
  return pool[seed % pool.length];
}

function SetupPhase({ onStart }) {
  const [company, setCompany] = useState(null);
  const [duration, setDuration] = useState(45);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-100">
          <Timer size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Interview Simulator</h1>
        <p className="text-sm text-slate-400 mt-2">
          Simulate a real coding interview with a countdown timer. No hints — focus and code.
        </p>
      </div>

      {/* Company selection */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Building2 size={12} /> Select Company
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COMPANIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCompany(c)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                company?.id === c.id
                  ? `${c.color} border-current shadow-sm scale-105`
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="text-2xl mb-1">{c.emoji}</div>
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="text-[10px] text-current opacity-60 mt-0.5">{c.tags.join(' · ')}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Duration selection */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Timer size={12} /> Duration
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                duration === d.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200'
              }`}
            >
              <p className="text-lg font-bold">{d.label}</p>
              <p className="text-xs opacity-60 mt-0.5">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Rules */}
      <Card className="p-4 mb-8 bg-amber-50 border border-amber-200">
        <p className="text-xs font-semibold text-amber-800 mb-2">📋 Interview Rules</p>
        <ul className="space-y-1.5 text-xs text-amber-700">
          <li>• Timer starts immediately when you click &quot;Start Interview&quot;</li>
          <li>• No AI hints or explanations during the session</li>
          <li>• Submit your solution before time runs out</li>
          <li>• A performance report is generated after the session ends</li>
        </ul>
      </Card>

      <Button
        variant="primary"
        size="lg"
        icon={<Play size={16} />}
        onClick={() => company && onStart(company, duration)}
        disabled={!company}
        className="w-full justify-center py-3 text-sm"
      >
        {company ? `Start ${company.name} Interview — ${duration} min` : 'Select a company to continue'}
      </Button>
    </div>
  );
}

function RunningPhase({ company, duration, problem, onEnd }) {
  const totalSeconds = duration * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [code, setCode] = useState(problem?.starterCodes?.javascript || '');
  const [language, setLanguage] = useState('javascript');
  const [submitted, setSubmitted] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onEnd({ timeLeft: 0, submitted, code });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []); // eslint-disable-line

  const handleSubmit = () => {
    clearInterval(intervalRef.current);
    setSubmitted(true);
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setRunResult({ success: true });
      setTimeout(() => onEnd({ timeLeft, submitted: true, code }), 1500);
    }, 1200);
  };

  const handleRun = () => {
    setIsRunning(true);
    setRunResult(null);
    setTimeout(() => {
      setIsRunning(false);
      setRunResult({ success: true, output: '// Code ran — add console.log() to see output', runtime: '—' });
    }, 800);
  };

  const pct = (timeLeft / totalSeconds) * 100;
  const timerColor =
    pct > 40 ? 'text-emerald-600' : pct > 20 ? 'text-amber-600' : 'text-red-600';

  if (!problem) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">{problem.name}</span>
          <Badge type="difficulty">{problem.difficulty}</Badge>
          <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
            <Building2 size={11} /> {company.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 font-mono text-xl font-bold px-3 py-1.5 rounded-xl border-2 tabular-nums ${
            pct > 40
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : pct > 20
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-red-200 bg-red-50 text-red-600 animate-pulse'
          }`}>
            <Timer size={16} />
            {fmtTime(timeLeft)}
          </div>
          <button
            onClick={() => onEnd({ timeLeft, submitted, code })}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-medium"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* Timer progress bar */}
      <div className="h-1 bg-slate-100">
        <div
          className={`h-1 transition-all ${pct > 40 ? 'bg-emerald-400' : pct > 20 ? 'bg-amber-400' : 'bg-red-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden divide-x divide-slate-100">
        {/* Left: Problem */}
        <div className="w-full lg:w-[40%] overflow-y-auto px-5 py-5 bg-white">
          <h1 className="text-lg font-bold text-slate-800 mb-3">{problem.name}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {problem.tags.map((t) => <Badge key={t}>{t}</Badge>)}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-5 whitespace-pre-line">
            {problem.description}
          </p>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Examples</h3>
          {problem.examples.map((ex, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-3 text-xs font-mono">
              <p className="text-slate-500 mb-1"><span className="font-bold text-slate-700">Input:</span> {ex.input}</p>
              <p className="text-slate-500 mb-1"><span className="font-bold text-slate-700">Output:</span> {ex.output}</p>
              {ex.explanation && <p className="text-slate-400"><span className="font-bold text-slate-600">Explanation:</span> {ex.explanation}</p>}
            </div>
          ))}
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 mt-5">Constraints</h3>
          <ul className="space-y-1.5">
            {problem.constraints.map((c, i) => (
              <li key={i} className="text-xs text-slate-500 font-mono flex gap-2">
                <span className="text-slate-300">•</span>
                <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Editor */}
        <div className="hidden lg:flex flex-col flex-1 overflow-hidden bg-slate-50">
          <div className="flex-1 p-3 overflow-hidden">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              onLanguageChange={(l, sc) => { setLanguage(l); setCode(sc || problem?.starterCodes?.[l] || ''); }}
              starterCodes={problem.starterCodes || {}}
            />
          </div>

          {runResult && (
            <div className={`mx-3 mb-2 p-3 rounded-xl text-xs font-mono border ${
              runResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {runResult.success ? '✓ ' : '✗ '}{runResult.output || 'Accepted'}
            </div>
          )}

          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Code2 size={12} /> No hints in simulator mode
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={<Play size={13} />} onClick={handleRun} loading={isRunning && !submitted}>
                Run
              </Button>
              <Button variant="success" size="sm" icon={<Send size={13} />} onClick={handleSubmit} loading={isRunning} disabled={submitted}>
                {submitted ? 'Submitted' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DebriefPhase({ company, duration, timeLeft, submitted, onRetry }) {
  const totalSeconds = duration * 60;
  const usedSeconds = totalSeconds - timeLeft;
  const usedMin = Math.floor(usedSeconds / 60);
  const leftMin = Math.floor(timeLeft / 60);
  const pctUsed = Math.round((usedSeconds / totalSeconds) * 100);

  const performance =
    submitted && timeLeft > duration * 60 * 0.3
      ? { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', emoji: '🏆' }
      : submitted && timeLeft > 5 * 60
      ? { label: 'Good', color: 'text-indigo-600 bg-indigo-50 border-indigo-200', emoji: '✅' }
      : submitted
      ? { label: 'Tight', color: 'text-amber-600 bg-amber-50 border-amber-200', emoji: '⚡' }
      : { label: 'Time Expired', color: 'text-red-600 bg-red-50 border-red-200', emoji: '⏰' };

  const tips = [
    submitted && timeLeft > 10 * 60 ? '🔥 Great pacing — you solved it with plenty of time to spare!' : null,
    submitted && timeLeft < 5 * 60 ? '⚡ You made it, but aim to finish with at least 5 minutes for edge cases.' : null,
    !submitted ? '⏰ Practice timed problems daily. Aim to solve Mediums in under 25 minutes.' : null,
    '🗣️ In real interviews, always talk through your approach before writing code.',
    '🧪 Test your solution with edge cases: empty input, single element, negative numbers.',
    '📊 After each problem, write down the pattern you used for faster recognition next time.',
  ].filter(Boolean);

  const checks = [
    { label: 'Submitted solution', ok: submitted },
    { label: 'Completed within time limit', ok: submitted && timeLeft > 0 },
    { label: `Under ${Math.round(duration * 0.7)} min (70% of time)`, ok: usedSeconds < duration * 60 * 0.7 },
    { label: 'Time to review edge cases', ok: submitted && timeLeft > 5 * 60 },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-8">
        <p className="text-4xl mb-3">{performance.emoji}</p>
        <h1 className="text-2xl font-bold text-slate-800">Interview Debrief</h1>
        <div className={`inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 rounded-full border text-sm font-semibold ${performance.color}`}>
          {performance.label}
        </div>
        <p className="text-sm text-slate-400 mt-2">{company.name} • {duration}-minute session</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Time Used', value: `${usedMin} min`, sub: `${pctUsed}% of allotted` },
          { label: 'Time Left', value: `${leftMin} min`, sub: submitted ? 'Reserved for review' : 'Expired' },
          { label: 'Outcome', value: submitted ? 'Submitted' : 'Not Submitted', sub: submitted ? '✓ Good' : '✗ Timeout' },
        ].map(({ label, value, sub }) => (
          <Card key={label} className="p-4 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-base font-bold text-slate-700">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </Card>
        ))}
      </div>

      {/* Checklist */}
      <Card className="p-5 mb-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Performance Checklist</h2>
        <div className="space-y-3">
          {checks.map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-3">
              {ok ? (
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
              ) : (
                <XCircle size={16} className="text-slate-300 flex-shrink-0" />
              )}
              <span className={`text-sm ${ok ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Feedback & Tips</h2>
        <div className="space-y-2.5">
          {tips.map((tip, i) => (
            <p key={i} className="text-sm text-slate-600 leading-relaxed">{tip}</p>
          ))}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" size="sm" icon={<RotateCcw size={14} />} onClick={onRetry} className="flex-1 justify-center">
          Try Again
        </Button>
        <Button variant="primary" size="sm" icon={<ChevronRight size={14} />} onClick={() => window.location.href = '/problems'} className="flex-1 justify-center">
          More Problems
        </Button>
      </div>
    </div>
  );
}

export default function InterviewSimulator() {
  const [phase, setPhase] = useState('setup'); // 'setup' | 'running' | 'debrief'
  const [sessionData, setSessionData] = useState(null);

  const handleStart = (company, duration) => {
    const problem = pickProblem(company);
    setSessionData({ company, duration, problem });
    setPhase('running');
  };

  const handleEnd = ({ timeLeft, submitted, code }) => {
    setSessionData((prev) => ({ ...prev, timeLeft, submitted, code }));
    setPhase('debrief');
  };

  const handleRetry = () => {
    setSessionData(null);
    setPhase('setup');
  };

  if (phase === 'setup') return <SetupPhase onStart={handleStart} />;
  if (phase === 'running') {
    return (
      <RunningPhase
        company={sessionData.company}
        duration={sessionData.duration}
        problem={sessionData.problem}
        onEnd={handleEnd}
      />
    );
  }
  return (
    <DebriefPhase
      company={sessionData.company}
      duration={sessionData.duration}
      timeLeft={sessionData.timeLeft}
      submitted={sessionData.submitted}
      onRetry={handleRetry}
    />
  );
}
