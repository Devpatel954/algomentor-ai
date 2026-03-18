import { useState } from 'react';
import { Play, RotateCcw, Copy, Check } from 'lucide-react';
import Button from './Button';

export default function CodeEditor({ value, onChange, language = 'javascript' }) {
  const [copied, setCopied] = useState(false);

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
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-amber-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-80" />
          </div>
          <span className="text-xs text-slate-400 ml-2 font-mono">{language}</span>
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
            onClick={() => onChange('')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-700"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </div>

      {/* Line numbers + Code Area */}
      <div className="flex flex-1 overflow-hidden">
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
      <div className="bg-slate-950 border-t border-slate-800 px-4 py-3">
        <p className="text-xs text-slate-500 font-mono">// Output will appear here after running</p>
      </div>
    </div>
  );
}
