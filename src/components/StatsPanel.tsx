
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { FrameType, type UserStats } from '../types';
import { FRAME_ICONS } from '../constants';

interface StatsPanelProps {
  stats: UserStats;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const radarData = Object.keys(FrameType).map(key => ({
    subject: FrameType[key as keyof typeof FrameType],
    score: stats.scores[FrameType[key as keyof typeof FrameType]] || 0,
    fullMark: 100,
  }));

  const recentHistory = stats.history.slice(-8).reverse();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Radar Chart Section */}
      <div className="glass rounded-3xl p-6 flex flex-col">
        <h3 className="text-sm font-black mb-2 text-blue-400 uppercase tracking-widest self-start flex items-center gap-2">
          Neural Architecture
        </h3>
        <div className="h-[300px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              margin={{ top: 20, right: 40, bottom: 20, left: 40 }} 
              data={radarData}
            >
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Proficiency"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stability Bars Section */}
      <div className="glass rounded-3xl p-6 flex flex-col">
        <h3 className="text-sm font-black mb-4 text-blue-400 uppercase tracking-widest flex items-center gap-2">
          Stability Index
        </h3>
        <div className="flex-1 space-y-2.5 overflow-y-auto pr-2 custom-scrollbar max-h-[250px]">
          {(Object.entries(stats.scores) as [FrameType, number][]).map(([frame, score]) => (
            <div key={frame} className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="text-slate-600">{FRAME_ICONS[frame]}</span>
                  {frame.toUpperCase()}
                </span>
                <span className="text-slate-200 tabular-nums">{score.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-all duration-1000 ease-out"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History Audit */}
      <div className="glass rounded-3xl p-6 md:col-span-2">
        <h3 className="text-sm font-black mb-4 text-blue-400 uppercase tracking-widest flex items-center gap-2">
          Calibration Audit Log
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentHistory.length > 0 ? (
            recentHistory.map((entry, i) => (
              <div key={i} className={`flex items-center justify-between text-[10px] p-2.5 rounded-xl border ${entry.isPractice ? 'bg-amber-900/10 border-amber-500/10' : 'bg-slate-900/40 border-white/5'}`}>
                <div className="flex flex-col">
                   <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">FRAME::{entry.frame.toUpperCase()}</span>
                    {entry.isPractice && <span className="text-[7px] text-amber-500/50 uppercase">SANDBOX</span>}
                   </div>
                   <span className="text-slate-400">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <span className={`font-black tracking-widest ${entry.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {entry.success ? 'PASS' : 'FAIL'}
                </span>
              </div>
            ))
          ) : (
            <div className="col-span-full py-4 text-center text-slate-600 font-mono text-xs italic uppercase tracking-widest">
              No recent audit data available. Start session to calibrate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
