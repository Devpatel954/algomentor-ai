import { useState } from 'react';
import { RotateCcw, Copy, Check, ChevronDown } from 'lucide-react';
import { LANGUAGES } from '../../data/dummy';

const LANGUAGE_COLORS = {
  javascript: 'text-yellow-400',
  python:     'text-blue-400',
  java:       'text-orange-400',
  cpp:        'text-cyan-400',
  typescript: 'text-sky-400',
  go:         'text-teal-400',
};

export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  onLanguageChange,
  starterCodes = {},
}) {
  const [copied, setCopied] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const spaces = language === 'python' ? '    ' : '  ';
      const newValue = value.substring(0, start) + spaces + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + spaces.length;
      }, 0);
    }
  };

  const handleLanguageSelect = (lang) => {
    setLangOpen(false);
    if (onLanguageChange) onLanguageChange(lang.id, starterCodes[lang.id] || '');
  };

  const handleReset = () => {
    onChange(starterCodes[language] || '');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-amber-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-80" />
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 border border-slate-600 text-xs font-mono font-medium text-slate-200"
            >
              <span className={`font-bold text-[11px] ${LANGUAGE_COLORS[language] || 'text-slate-300'}`}>
                {currentLang.monoIcon}
              </span>
              {currentLang.label}
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {langOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden min-w-[140px]">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLanguageSelect(lang)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-700 text-left ${
                      lang.id === language ? 'bg-slate-700 text-white' : 'text-slate-300'
                    }`}
                  >
                    <span className={`font-bold text-[10px] w-4 ${LANGUAGE_COLORS[lang.id] || 'text-slate-400'}`}>
                      {lang.monoIcon}
                    </span>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-700"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-700"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </div>

      {/* Line numbers + Code Area */}
      <div className="flex flex-1 overflow-hidden" onClick={() => langOpen && setLangOpen(false)}>
        {/* Line numbers */}
        <div className="bg-slate-900 px-3 py-4 select-none border-r border-slate-800">
          {value.split('\n').map((_, i) => (
            <div key={i} className="text-xs text-slate-600 font-mono leading-6 text-right min-w-[20px]">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code textarea */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 bg-slate-900 text-slate-100 font-mono text-sm leading-6 p-4 resize-none focus:outline-none caret-indigo-400"
          style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace" }}
        />
      </div>

      {/* Output area */}
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-3 flex items-center gap-2">
        <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-800 ${LANGUAGE_COLORS[language] || 'text-slate-400'}`}>
          {currentLang.ext}
        </span>
        <p className="text-xs text-slate-500 font-mono">// Output will appear here after running</p>
      </div>
    </div>
  );
}
