import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, BookOpen,
  Target, Zap, Trophy, Building2, ArrowRight, Star,
} from 'lucide-react';
import Card from '../components/ui/Card';
import { faangRoadmap, companyFocus, problems } from '../data/dummy';

const COLOR_MAP = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: 'text-emerald-500',
    bar: 'bg-emerald-500',
    phase: 'bg-emerald-500',
    pill: 'bg-emerald-500',
    text: 'text-emerald-700',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: 'text-blue-500',
    bar: 'bg-blue-500',
    phase: 'bg-blue-500',
    pill: 'bg-blue-500',
    text: 'text-blue-700',
  },
  violet: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700 border-violet-200',
    icon: 'text-violet-500',
    bar: 'bg-violet-500',
    phase: 'bg-violet-500',
    pill: 'bg-violet-500',
    text: 'text-violet-700',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: 'text-amber-500',
    bar: 'bg-amber-500',
    phase: 'bg-amber-500',
    pill: 'bg-amber-500',
    text: 'text-amber-700',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: 'text-rose-500',
    bar: 'bg-rose-500',
    phase: 'bg-rose-500',
    pill: 'bg-rose-500',
    text: 'text-rose-700',
  },
};

function ProgressRing({ percentage, color, size = 48 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const colorStroke = {
    emerald: '#10b981',
    blue: '#3b82f6',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    rose: '#f43f5e',
  }[color] || '#6366f1';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={colorStroke}
        strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

function TopicCard({ topic, color }) {
  const [open, setOpen] = useState(false);
  const c = COLOR_MAP[color];
  const total = topic.problems || 0;
  const done = topic.completedProblems || 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const relatedProblems = problems.filter((p) =>
    topic.keyProblems.includes(p.name)
  );

  return (
    <div className={`border rounded-xl overflow-hidden ${c.border} bg-white`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 text-left"
      >
        <div className="flex items-center gap-3">
          {done === total && total > 0 ? (
            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
          ) : (
            <Circle size={16} className="text-slate-300 flex-shrink-0" />
          )}
          <div>
            <p className="text-sm font-semibold text-slate-800">{topic.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {total > 0 ? `${done}/${total} problems` : 'Conceptual topic'} · {topic.difficulty}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {total > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className={`h-1.5 rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-slate-500 font-medium w-7">{pct}%</span>
            </div>
          )}
          {open ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className={`px-4 pb-4 pt-1 border-t ${c.border} ${c.bg}`}>
          {/* Key Concepts */}
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Key Concepts</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {topic.concepts.map((concept) => (
              <span key={concept} className={`text-xs px-2 py-0.5 rounded-md border font-medium ${c.badge}`}>
                {concept}
              </span>
            ))}
          </div>

          {/* Key Problems */}
          {topic.keyProblems.length > 0 && (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Must-Solve Problems</p>
              <div className="space-y-1.5">
                {topic.keyProblems.map((pName) => {
                  const p = relatedProblems.find((rp) => rp.name === pName);
                  return p ? (
                    <Link
                      key={pName}
                      to={`/problems/${p.id}`}
                      className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 group"
                    >
                      <span className="text-sm text-slate-700 group-hover:text-indigo-600 font-medium truncate mr-2">
                        {pName}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          p.difficulty === 'Easy' ? 'text-emerald-600 bg-emerald-50' :
                          p.difficulty === 'Medium' ? 'text-amber-600 bg-amber-50' :
                          'text-red-600 bg-red-50'
                        }`}>
                          {p.difficulty}
                        </span>
                        <ArrowRight size={12} className="text-slate-400 group-hover:text-indigo-500" />
                      </div>
                    </Link>
                  ) : (
                    <div key={pName} className="flex items-center px-3 py-2 bg-white rounded-lg border border-slate-100">
                      <span className="text-sm text-slate-600">{pName}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PhaseCard({ phase }) {
  const [expanded, setExpanded] = useState(phase.phase <= 2);
  const c = COLOR_MAP[phase.color];

  const totalProblems = phase.topics.reduce((sum, t) => sum + (t.problems || 0), 0);
  const doneProblems = phase.topics.reduce((sum, t) => sum + (t.completedProblems || 0), 0);
  const pct = totalProblems > 0 ? Math.round((doneProblems / totalProblems) * 100) : 0;

  return (
    <Card className="overflow-hidden">
      {/* Phase Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start gap-4 px-5 py-4 hover:bg-slate-50 text-left"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.phase} flex-shrink-0`}>
          <span className="text-white font-bold text-sm">{phase.phase}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-slate-800 text-base">{phase.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${c.badge}`}>
              {phase.duration}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-2">{phase.description}</p>
          {totalProblems > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 max-w-[160px] bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className={`h-1.5 rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-slate-400">{doneProblems}/{totalProblems} problems</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          {expanded
            ? <ChevronUp size={18} className="text-slate-400" />
            : <ChevronDown size={18} className="text-slate-400" />
          }
        </div>
      </button>

      {/* Topics */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
          {phase.topics.map((topic) => (
            <TopicCard key={topic.name} topic={topic} color={phase.color} />
          ))}
        </div>
      )}
    </Card>
  );
}

function CompanyCard({ company }) {
  const [open, setOpen] = useState(false);
  const diffColor =
    company.difficulty === 'Very Hard' ? 'text-red-600 bg-red-50 border-red-200'
    : 'text-orange-600 bg-orange-50 border-orange-200';

  return (
    <Card hover className="overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left">
        <div className={`h-1.5 w-full bg-gradient-to-r ${company.color}`} />
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${company.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{company.logo}</span>
              </div>
              <div>
                <p className="font-bold text-slate-800">{company.name}</p>
                <p className="text-xs text-slate-400">{company.rounds} interview rounds</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${diffColor}`}>
              {company.difficulty}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {company.focus.map((f) => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                {f}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{company.mustSolve.length} must-solve problems</span>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Tips</p>
          <ul className="space-y-1.5 mb-4">
            {company.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <Star size={10} className="text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" />
                {tip}
              </li>
            ))}
          </ul>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Must-Solve for {company.name}</p>
          <div className="space-y-1.5">
            {company.mustSolve.map((pName) => {
              const p = problems.find((pr) => pr.name === pName);
              return p ? (
                <Link
                  key={pName}
                  to={`/problems/${p.id}`}
                  className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 group"
                >
                  <span className="text-sm text-slate-700 group-hover:text-indigo-600 font-medium truncate mr-2">{pName}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      p.difficulty === 'Easy' ? 'text-emerald-600 bg-emerald-50' :
                      p.difficulty === 'Medium' ? 'text-amber-600 bg-amber-50' :
                      'text-red-600 bg-red-50'
                    }`}>
                      {p.difficulty}
                    </span>
                    <ArrowRight size={12} className="text-slate-400 group-hover:text-indigo-500" />
                  </div>
                </Link>
              ) : (
                <div key={pName} className="flex items-center px-3 py-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-sm text-slate-600">{pName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function Roadmap() {
  const [activeTab, setActiveTab] = useState('roadmap');

  const totalPhaseProblems = faangRoadmap.reduce((sum, p) =>
    sum + p.topics.reduce((s, t) => s + (t.problems || 0), 0), 0
  );
  const donePhaseProblems = faangRoadmap.reduce((sum, p) =>
    sum + p.topics.reduce((s, t) => s + (t.completedProblems || 0), 0), 0
  );
  const overallPct = totalPhaseProblems > 0 ? Math.round((donePhaseProblems / totalPhaseProblems) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Trophy size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">FAANG Roadmap</h1>
        </div>
        <p className="text-sm text-slate-400">
          A structured path to crack Google, Meta, Amazon, Apple & Netflix interviews.
        </p>
      </div>

      {/* Overall Progress Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wide mb-1">Overall Progress</p>
            <h2 className="text-2xl font-bold">{overallPct}% Complete</h2>
            <p className="text-indigo-200 text-sm mt-1">
              {donePhaseProblems} of {totalPhaseProblems} roadmap problems solved
            </p>
          </div>
          <div className="flex items-center gap-4">
            {faangRoadmap.map((phase) => {
              const total = phase.topics.reduce((s, t) => s + (t.problems || 0), 0);
              const done = phase.topics.reduce((s, t) => s + (t.completedProblems || 0), 0);
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div key={phase.phase} className="flex flex-col items-center gap-1">
                  <ProgressRing percentage={pct} color={phase.color} size={44} />
                  <span className="text-indigo-200 text-[10px] font-medium">P{phase.phase}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 w-full bg-indigo-500/40 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-white/80"
            style={{ width: `${overallPct}%`, transition: 'width 0.8s ease' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-slate-100 rounded-xl p-1 shadow-sm w-fit">
        {[
          { id: 'roadmap', label: 'Phase Roadmap', icon: <Target size={14} /> },
          { id: 'companies', label: 'By Company', icon: <Building2 size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Phase Roadmap Tab */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {faangRoadmap.map((phase) => {
              const c = COLOR_MAP[phase.color];
              const total = phase.topics.reduce((s, t) => s + (t.problems || 0), 0);
              const done = phase.topics.reduce((s, t) => s + (t.completedProblems || 0), 0);
              return (
                <Card key={phase.phase} className="p-3 text-center">
                  <div className={`w-7 h-7 rounded-lg ${c.phase} flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-white font-bold text-xs">{phase.phase}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 leading-tight mb-1 line-clamp-2">
                    {phase.title.replace('Phase ' + phase.phase + ': ', '')}
                  </p>
                  {total > 0 && (
                    <p className={`text-xs font-bold ${c.text}`}>{done}/{total}</p>
                  )}
                  <p className="text-[10px] text-slate-400">{phase.duration}</p>
                </Card>
              );
            })}
          </div>

          {/* Phase Cards */}
          {faangRoadmap.map((phase) => (
            <PhaseCard key={phase.phase} phase={phase} />
          ))}

          {/* CTA */}
          <Card className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 border-0 text-center">
            <Zap size={24} className="text-indigo-400 mx-auto mb-2" fill="currentColor" />
            <h3 className="text-white font-bold text-lg mb-1">Ready to start?</h3>
            <p className="text-slate-400 text-sm mb-4">Jump into the problems and start building your skills.</p>
            <Link
              to="/problems"
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
            >
              <BookOpen size={15} /> Browse Problems <ArrowRight size={14} />
            </Link>
          </Card>
        </div>
      )}

      {/* By Company Tab */}
      {activeTab === 'companies' && (
        <div>
          <p className="text-sm text-slate-500 mb-4">
            Each company has a different interview focus. Tailor your prep accordingly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyFocus.map((company) => (
              <CompanyCard key={company.name} company={company} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
