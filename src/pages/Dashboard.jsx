import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, Flame, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { stats, suggestedProblems, recentActivity } from '../data/dummy';

function StatCard({ label, value, suffix = '', icon, color, sub }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-slate-800">{value}</span>
        {suffix && <span className="text-lg font-semibold text-slate-400 mb-0.5">{suffix}</span>}
      </div>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </Card>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Ready to practice? 🚀</h1>
        <p className="text-sm text-slate-400 mt-1">
          You're on a {stats.currentStreak}-day streak. Keep it going!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              label="Problems Solved"
              value={stats.problemsSolved}
              icon={<CheckCircle2 size={16} className="text-emerald-600" />}
              color="bg-emerald-50"
              sub={`out of ${stats.totalAttempted} attempted`}
            />
            <StatCard
              label="Accuracy"
              value={stats.accuracy}
              suffix="%"
              icon={<Target size={16} className="text-indigo-600" />}
              color="bg-indigo-50"
              sub="Overall success rate"
            />
            <StatCard
              label="Current Streak"
              value={stats.currentStreak}
              suffix="days"
              icon={<Flame size={16} className="text-amber-600" />}
              color="bg-amber-50"
              sub="Don't break the chain!"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Practice */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 text-sm">Continue Practice</h2>
              <Link to="/problems" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-indigo-500 font-medium mb-1">Where you left off</p>
                <h3 className="font-semibold text-slate-800">Longest Substring Without Repeating Characters</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge type="difficulty">Medium</Badge>
                  <Badge>Sliding Window</Badge>
                  <Badge>String</Badge>
                </div>
              </div>
              <Link to="/problems/3">
                <Button variant="primary" size="sm" icon={<ArrowRight size={14} />}>
                  Resume
                </Button>
              </Link>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 text-sm">Recent Activity</h2>
              <Clock size={14} className="text-slate-300" />
            </div>
            <div className="space-y-2">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.status === 'Solved' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-sm text-slate-700 font-medium">{item.problem}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge type="difficulty">{item.difficulty}</Badge>
                    <Badge type="status">{item.status}</Badge>
                    <span className="text-xs text-slate-400 hidden sm:block">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Recommended */}
        <div>
          <Card className="p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles size={11} className="text-white" />
              </div>
              <h2 className="font-semibold text-slate-800 text-sm">AI Recommended</h2>
            </div>
            <div className="space-y-3">
              {suggestedProblems.map((p) => (
                <Link key={p.id} to={`/problems/${p.id}`}>
                  <div className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 group">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-700 leading-snug">{p.name}</p>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 flex-shrink-0 mt-0.5" />
                    </div>
                    <Badge type="difficulty">{p.difficulty}</Badge>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.reason}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <Link to="/problems">
                <Button variant="ghost" size="sm" className="w-full justify-center text-indigo-500 hover:bg-indigo-50">
                  Explore all problems
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
