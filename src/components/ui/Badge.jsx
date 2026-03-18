const difficultyConfig = {
  Easy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  Hard: 'bg-red-50 text-red-700 border border-red-200',
};

const statusConfig = {
  Solved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Attempted: 'bg-blue-50 text-blue-700 border border-blue-200',
  'Not Started': 'bg-slate-50 text-slate-500 border border-slate-200',
};

const tagConfig = 'bg-slate-100 text-slate-600 border border-slate-200';

export default function Badge({ children, type = 'tag' }) {
  let classes = tagConfig;

  if (type === 'difficulty') {
    classes = difficultyConfig[children] || tagConfig;
  } else if (type === 'status') {
    classes = statusConfig[children] || tagConfig;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${classes}`}>
      {type === 'status' && children === 'Solved' && (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {children}
    </span>
  );
}
