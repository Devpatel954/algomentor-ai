export default function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-slate-100 shadow-sm
        ${hover ? 'hover:shadow-md hover:border-slate-200 cursor-pointer hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
