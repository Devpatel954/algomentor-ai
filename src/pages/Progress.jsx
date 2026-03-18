import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { progressData, topicPerformance, weakAreas, stats } from '../data/dummy';

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
    </div>
  );
}
