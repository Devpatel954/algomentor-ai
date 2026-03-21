import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { TrendingUp, AlertTriangle, Target, Zap, CalendarDays } from 'lucide-react';
import Card from '../components/ui/Card';
import { progressData, topicPerformance, weakAreas, stats } from '../data/dummy';
import { solvedStorage } from '../utils/storage';

// Generate 365-day heatmap (deterministic mock + real localStorage data)
function buildHeatmapData() {
  const result = {};
  const today = new Date();
  let seed = 42; // deterministic seed
  const lcg = () => { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff; };

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const r = lcg();
    const recentBoost = i < 14 ? 0.25 : i < 30 ? 0.12 : 0;
    result[key] = r < 0.28 + recentBoost ? Math.ceil(lcg() * 3) : 0;
  }

  // Overlay real solved dates
  const realMap = solvedStorage.getDateMap();
  Object.keys(realMap).forEach((date) => {
    result[date] = (result[date] || 0) + 1;
  });

  return result;
}

// Build a 52-week grid structure (columns=weeks, rows=days Mon–Sun)
function buildGrid(data) {
  const weeks = [];
  const today = new Date();
  // Align to Sunday of the current week
  const currentDay = today.getDay(); // 0=Sun
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (6 - currentDay));

  for (let w = 51; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - w * 7 - (6 - d));
      const key = date.toISOString().split('T')[0];
      week.push({ date: key, count: data[key] ?? null, future: date > today });
    }
    weeks.push(week);
  }
  return weeks;
}

function getColor(count, future) {
  if (future || count === null) return 'bg-slate-100';
  if (count === 0) return 'bg-slate-100';
  if (count <= 1) return 'bg-emerald-200';
  if (count <= 2) return 'bg-emerald-400';
  if (count <= 4) return 'bg-emerald-500';
  return 'bg-emerald-600';
}

function HeatmapCalendar() {
  const data = useMemo(() => buildHeatmapData(), []);
  const weeks = useMemo(() => buildGrid(data), [data]);
  const [tooltip, setTooltip] = useState(null);

  // Month labels
  const monthLabels = [];
  weeks.forEach((week, wi) => {
    const firstDay = week.find((d) => d.date);
    if (firstDay) {
      const date = new Date(firstDay.date);
      if (date.getDate() <= 7) {
        monthLabels.push({ wi, label: date.toLocaleString('default', { month: 'short' }) });
      }
    }
  });

  const totalSolved = Object.values(data).reduce((s, c) => s + c, 0);
  const activeDays = Object.values(data).filter((c) => c > 0).length;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={15} className="text-emerald-500" />
          <h2 className="text-sm font-semibold text-slate-800">Activity Heatmap</h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>{totalSolved} solves this year</span>
          <span>{activeDays} active days</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.wi === wi);
              return (
                <div key={wi} className="w-3.5 mr-0.5 text-[10px] text-slate-400" style={{ flexShrink: 0 }}>
                  {label ? label.label : ''}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1 text-[10px] text-slate-400 leading-none">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                <div key={i} className="h-3.5 flex items-center">{d}</div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map(({ date, count, future }) => (
                  <div
                    key={date}
                    className={`w-3.5 h-3.5 rounded-sm ${getColor(count, future)} cursor-pointer transition-opacity hover:opacity-80 relative`}
                    onMouseEnter={() => date && !future && setTooltip({ date, count: count ?? 0 })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1 mt-2 ml-8">
            <span className="text-[10px] text-slate-400 mr-1">Less</span>
            {['bg-slate-100', 'bg-emerald-200', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600'].map((c) => (
              <div key={c} className={`w-3.5 h-3.5 rounded-sm ${c}`} />
            ))}
            <span className="text-[10px] text-slate-400 ml-1">More</span>
          </div>
        </div>
      </div>

      {tooltip && (
        <div className="mt-2 text-xs text-center">
          <span className="inline-flex items-center gap-1.5 bg-slate-800 text-slate-100 px-3 py-1.5 rounded-lg">
            <span className="font-semibold">{tooltip.count}</span> problem{tooltip.count !== 1 ? 's' : ''} solved
            <span className="text-slate-400">·</span>
            {new Date(tooltip.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      )}
    </Card>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3.5 py-2.5 text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        <p className="text-indigo-600">{payload[0].value} problems solved</p>
      </div>
    );
  }
  return null;
}

function TopicBar({ topic, solved, total, accuracy }) {
  const percentage = Math.round((solved / total) * 100);
  const color =
    accuracy >= 80 ? 'bg-emerald-500' :
    accuracy >= 60 ? 'bg-amber-500' : 'bg-red-400';

  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-medium text-slate-600 w-28 flex-shrink-0">{topic}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-16 text-right">{solved}/{total}</span>
      <span className={`text-xs font-medium w-10 text-right ${
        accuracy >= 80 ? 'text-emerald-600' : accuracy >= 60 ? 'text-amber-600' : 'text-red-500'
      }`}>{accuracy}%</span>
    </div>
  );
}

const radarData = topicPerformance.map((t) => ({ topic: t.topic, value: t.accuracy }));

export default function Progress() {
  const totalSolved = stats.problemsSolved;
  const easy = 18, medium = 22, hard = 7;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Progress</h1>
        <p className="text-sm text-slate-400 mt-1">Track your coding journey and identify areas to improve.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Solved', value: totalSolved, color: 'text-slate-800' },
          { label: 'Easy', value: easy, color: 'text-emerald-600' },
          { label: 'Medium', value: medium, color: 'text-amber-600' },
          { label: 'Hard', value: hard, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Area Chart */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">Problems Solved Over Time</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={progressData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="solvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="solved"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#solvedGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Radar Chart */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={15} className="text-violet-500" />
            <h2 className="text-sm font-semibold text-slate-800">Topic Radar</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 10, right: 15, left: 15, bottom: 10 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="topic" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Radar
                name="Accuracy"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic wise breakdown */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Topic-wise Performance</h2>
          <div className="space-y-3.5">
            {topicPerformance.map((t) => (
              <TopicBar key={t.topic} {...t} />
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50 text-xs text-slate-400">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" />≥80%</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" />60–79%</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400" />&lt;60%</div>
          </div>
        </Card>

        {/* Weak Areas */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-800">Weak Areas</h2>
          </div>
          <div className="space-y-3">
            {weakAreas.map((area) => (
              <div key={area.topic} className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">{area.topic}</span>
                  <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                    {area.accuracy}% accuracy
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Zap size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-500 leading-relaxed">{area.suggestion}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50">
            <p className="text-xs text-slate-400 text-center">
              AI analyzes your patterns to surface the most impactful areas to practice.
            </p>
          </div>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <div className="mt-6">
        <HeatmapCalendar />
      </div>
    </div>
  );
}
