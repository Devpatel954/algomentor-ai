export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 p-5 ${className}`}>
      <div className="skeleton h-4 w-24 rounded mb-3" />
      <div className="skeleton h-8 w-16 rounded mb-2" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 px-5 border-b border-slate-50">
      <div className="skeleton h-4 w-48 rounded" />
      <div className="skeleton h-5 w-16 rounded-md ml-auto" />
      <div className="skeleton h-5 w-20 rounded-md" />
      <div className="skeleton h-5 w-20 rounded-md" />
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}
