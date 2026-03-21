import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Clock, Database, BookOpen } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { algorithmPatterns } from '../data/dummy';

const LANG_OPTS = ['javascript', 'python'];
const LANG_LABELS = { javascript: 'JavaScript', python: 'Python' };

const difficultyColor = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-red-50 text-red-700 border-red-200',
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function PatternCard({ pattern }) {
  const [expanded, setExpanded] = useState(false);
  const [lang, setLang] = useState('javascript');

  return (
    <Card className={`overflow-hidden transition-shadow duration-200 ${expanded ? 'shadow-md border-slate-200' : 'hover:shadow-md hover:border-slate-200'}`}>
      {/* Card Header — always visible */}
      <button
        className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-4 min-w-0">
          <span className="text-2xl flex-shrink-0">{pattern.emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-bold text-slate-800">{pattern.name}</h3>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${difficultyColor[pattern.difficulty] || difficultyColor['Medium']}`}
              >
                {pattern.difficulty}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                {pattern.category}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{pattern.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {pattern.timeComplexity}
            </span>
            <span className="flex items-center gap-1">
              <Database size={11} /> {pattern.spaceComplexity}
            </span>
          </div>
          {expanded ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-5 animate-fade-in">
          <div className="sm:hidden flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Clock size={11} /> Time: {pattern.timeComplexity}</span>
            <span className="flex items-center gap-1"><Database size={11} /> Space: {pattern.spaceComplexity}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* When to use */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">When to use</h4>
              <ul className="space-y-1.5">
                {pattern.whenToUse.map((hint, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-indigo-400 mt-0.5">→</span>
                    {hint}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Key Tips</h4>
              <ul className="space-y-1.5">
                {pattern.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="text-amber-400 mt-0.5">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Code template */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Template</h4>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 rounded-md p-0.5 gap-0.5">
                  {LANG_OPTS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${
                        lang === l
                          ? 'bg-white text-slate-700 shadow-sm'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
                <CopyButton text={pattern.template[lang] || ''} />
              </div>
            </div>
            <div className="relative">
              <pre className="bg-slate-900 text-slate-200 text-xs rounded-xl p-4 overflow-x-auto leading-loose max-h-72 font-mono scrollbar-thin">
                <code>{pattern.template[lang] || '// Template not available for this language'}</code>
              </pre>
            </div>
          </div>

          {/* Related problems */}
          {pattern.relatedProblems?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <BookOpen size={11} /> Related Problems
              </h4>
              <div className="flex flex-wrap gap-2">
                {pattern.relatedProblems.map((name) => (
                  <span
                    key={name}
                    className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-lg font-medium"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function Patterns() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(algorithmPatterns.map((p) => p.category))];

  const filtered = algorithmPatterns.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Algorithm Patterns</h1>
        <p className="text-sm text-slate-400 mt-1">
          Master the {algorithmPatterns.length} most common coding interview patterns with templates and examples.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search patterns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white placeholder-slate-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pattern grid */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm font-medium">No patterns match your search</p>
          </div>
        ) : (
          filtered.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))
        )}
      </div>

      <p className="text-xs text-slate-400 text-center mt-6">
        Showing {filtered.length} of {algorithmPatterns.length} patterns
      </p>
    </div>
  );
}
