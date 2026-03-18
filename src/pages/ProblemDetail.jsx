import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Send, Lightbulb, Code2, MessageSquare, Sparkles, Bot } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import CodeEditor from '../components/ui/CodeEditor';
import AIAssistant from '../components/ui/AIAssistant';
import { problems } from '../data/dummy';
import { submissionsApi } from '../services/api';

const TABS = ['Description', 'Submissions', 'Discussion'];

function SubmissionsTab() {
  const submissions = [
    { date: '2 hours ago', status: 'Accepted', runtime: '72ms', memory: '42.1 MB', language: 'JavaScript' },
    { date: 'Yesterday', status: 'Wrong Answer', runtime: '—', memory: '—', language: 'JavaScript' },
  ];
  return (
    <div className="space-y-3">
      {submissions.map((s, i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
          <div>
            <span className={`text-sm font-medium ${s.status === 'Accepted' ? 'text-emerald-600' : 'text-red-500'}`}>
              {s.status}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">{s.date} · {s.language}</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            {s.runtime !== '—' && <p>Runtime: <span className="text-slate-600 font-medium">{s.runtime}</span></p>}
            {s.memory !== '—' && <p>Memory: <span className="text-slate-600 font-medium">{s.memory}</span></p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function DiscussionTab() {
  const posts = [
    { user: 'alexc', time: '1 day ago', comment: 'Use a HashMap for O(n) solution. Key insight: check if complement exists!', likes: 24 },
    { user: 'sara_dev', time: '3 days ago', comment: 'Great problem for learning hash maps. Here\'s my Python approach...', likes: 12 },
  ];
  return (
    <div className="space-y-4">
      {posts.map((p, i) => (
        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                {p.user[0].toUpperCase()}
              </div>
              <span className="text-xs font-medium text-slate-700">{p.user}</span>
            </div>
            <span className="text-xs text-slate-400">{p.time}</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{p.comment}</p>
          <p className="text-xs text-slate-400 mt-2">👍 {p.likes}</p>
        </div>
      ))}
    </div>
  );
}

export default function ProblemDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Description');
  const [code, setCode] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const problem = problems.find((p) => p.id === Number(id));

  useEffect(() => {
    if (problem) setCode(problem.starterCode);
  }, [problem]);

  if (!problem) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-700">Problem not found</h2>
        <Link to="/problems" className="text-indigo-500 text-sm hover:underline mt-2 block">← Back to problems</Link>
      </div>
    );
  }

  const handleRun = () => {
    setIsRunning(true);
    setRunResult(null);
    setTimeout(() => {
      setIsRunning(false);
      setRunResult({ success: true, output: '[0, 1]', expected: '[0, 1]', runtime: '68ms' });
    }, 1500);
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setRunResult(null);
    try {
      const data = await submissionsApi.submit(problem.id, code, 'javascript');
      setSubmitted(data.status === 'Accepted');
      setRunResult({
        success: data.status === 'Accepted',
        output: data.message,
        runtime: `${data.runtime_ms}ms`,
        memory: `${data.memory_mb} MB`,
      });
    } catch (err) {
      setRunResult({ success: false, output: `Error: ${err.message}` });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <Link to="/problems" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
            <ArrowLeft size={14} /> Problems
          </Link>
          <span className="text-slate-200">/</span>
          <span className="text-xs font-medium text-slate-700 truncate max-w-xs">{problem.name}</span>
          <Badge type="difficulty">{problem.difficulty}</Badge>
          <Badge type="status">{problem.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Lightbulb size={13} />}
            onClick={() => { setAiOpen(true); }}
          >
            <span className="hidden sm:inline">Get Hint</span>
          </Button>
          <Button
            variant="ai"
            size="sm"
            icon={<Sparkles size={13} />}
            onClick={() => setAiOpen(true)}
          >
            <span className="hidden sm:inline">Ask AI</span>
          </Button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden divide-x divide-slate-100">
        {/* Left: Problem Description */}
        <div className="w-full lg:w-[45%] flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-white px-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'Description' && <Code2 size={12} />}
                {tab === 'Submissions' && <Send size={12} />}
                {tab === 'Discussion' && <MessageSquare size={12} />}
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 bg-white">
            {activeTab === 'Description' && (
              <div>
                <h1 className="text-lg font-bold text-slate-800 mb-3">{problem.name}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {problem.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-5 whitespace-pre-line">
                  {problem.description}
                </p>

                {/* Examples */}
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Examples</h3>
                {problem.examples.map((ex, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-3 text-xs font-mono">
                    <p className="text-slate-500 mb-1"><span className="font-bold text-slate-700">Input:</span> {ex.input}</p>
                    <p className="text-slate-500 mb-1"><span className="font-bold text-slate-700">Output:</span> {ex.output}</p>
                    {ex.explanation && <p className="text-slate-400"><span className="font-bold text-slate-600">Explanation:</span> {ex.explanation}</p>}
                  </div>
                ))}

                {/* Constraints */}
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
            )}
            {activeTab === 'Submissions' && <SubmissionsTab />}
            {activeTab === 'Discussion' && <DiscussionTab />}
          </div>
        </div>

        {/* Right: Code Editor */}
        <div className="hidden lg:flex flex-col flex-1 overflow-hidden bg-slate-50">
          {/* Code Editor */}
          <div className="flex-1 p-3 overflow-hidden">
            <CodeEditor value={code} onChange={setCode} />
          </div>

          {/* Run Result */}
          {runResult && (
            <div className={`mx-3 mb-2 p-3 rounded-xl text-xs font-mono border ${
              runResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {runResult.success ? '✓ ' : '✗ '}{runResult.output}
              {runResult.runtime && <span className="ml-3 text-slate-400">Runtime: {runResult.runtime}</span>}
              {runResult.memory && <span className="ml-3 text-slate-400">Memory: {runResult.memory}</span>}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            <Button
              variant="secondary"
              size="sm"
              icon={<Code2 size={13} />}
              onClick={() => setAiOpen(true)}
            >
              Explain Code
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<Play size={13} />}
                onClick={handleRun}
                loading={isRunning}
              >
                Run
              </Button>
              <Button
                variant="success"
                size="sm"
                icon={<Send size={13} />}
                onClick={handleSubmit}
                loading={isRunning}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Panel */}
      <AIAssistant
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        problemContext={{ id: problem.id, description: problem.description, title: problem.name }}
        userCode={code}
      />

      {/* Floating AI button (when panel closed) */}
      {!aiOpen && (
        <button
          onClick={() => setAiOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:shadow-indigo-200 flex items-center justify-center group z-30"
        >
          <Bot size={20} />
          <span className="absolute right-14 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
            Ask AI Assistant
          </span>
        </button>
      )}
    </div>
  );
}
