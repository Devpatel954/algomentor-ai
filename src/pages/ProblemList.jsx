import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronRight, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/Skeleton';
import { problems } from '../data/dummy';

const allTags = [...new Set(problems.flatMap((p) => p.tags))].sort();
const difficulties = ['Easy', 'Medium', 'Hard'];

export default function ProblemList() {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
      const matchTags = selectedTags.length === 0 || selectedTags.every((t) => p.tags.includes(t));
      return matchSearch && matchDiff && matchTags;
    });
  }, [search, selectedDifficulty, selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedDifficulty('All');
    setSelectedTags([]);
  };

  const hasFilters = search || selectedDifficulty !== 'All' || selectedTags.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Problems</h1>
        <p className="text-sm text-slate-400 mt-1">{problems.length} problems available</p>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-slate-50 placeholder-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Difficulty filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedDifficulty === 'All' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedDifficulty('All')}
            >
              All
            </Button>
            {difficulties.map((d) => (
              <Button
                key={d}
                variant={selectedDifficulty === d ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedDifficulty(d)}
              >
                {d}
              </Button>
            ))}
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-400">
              <X size={14} /> Clear
            </Button>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                selectedTags.includes(tag)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card>
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
          <div className="col-span-5">Problem</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-3">Tags</div>
          <div className="col-span-2">Status</div>
        </div>

        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={24} />}
            title="No problems found"
            description="Try adjusting your search or filters to find what you're looking for."
            action={
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          filtered.map((problem, i) => (
            <Link
              key={problem.id}
              to={`/problems/${problem.id}`}
              className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 items-center group"
            >
              <div className="col-span-5 flex items-center gap-3">
                <span className="text-xs text-slate-300 w-5 text-right">{i + 1}</span>
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">
                  {problem.name}
                </span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 ml-auto" />
              </div>
              <div className="col-span-2">
                <Badge type="difficulty">{problem.difficulty}</Badge>
              </div>
              <div className="col-span-3 flex flex-wrap gap-1">
                {problem.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
                {problem.tags.length > 2 && (
                  <span className="text-xs text-slate-400">+{problem.tags.length - 2}</span>
                )}
              </div>
              <div className="col-span-2">
                <Badge type="status">{problem.status}</Badge>
              </div>
            </Link>
          ))
        )}
      </Card>

      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-center mt-4">
          Showing {filtered.length} of {problems.length} problems
        </p>
      )}
    </div>
  );
}
