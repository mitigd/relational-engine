
import { useState, useEffect } from 'react';
import { FrameType, type UserStats } from './types';
import GameEngine from './components/GameEngine';
import StatsPanel from './components/StatsPanel';
import { BrainCircuit, Activity, Settings, Play, BarChart3, ChevronLeft, X, ToggleLeft, ToggleRight, Trash2, Languages, Cpu } from 'lucide-react';

const INITIAL_STATS: UserStats = {
  scores: {
    [FrameType.COORDINATION]: 10,
    [FrameType.OPPOSITION]: 10,
    [FrameType.DISTINCTION]: 10,
    [FrameType.COMPARISON]: 10,
    [FrameType.HIERARCHICAL]: 10,
    [FrameType.TEMPORAL]: 10,
    [FrameType.SPATIAL]: 10,
    [FrameType.CAUSAL]: 10,
    [FrameType.DEICTIC]: 10,
    [FrameType.TRANSFORMATION]: 10,
    [FrameType.MIXED]: 10,
  },
  history: [],
  settings: {
    timerEnabled: true,
    timerDuration: 30,
    practiceMode: false,
    useNaturalLanguage: false,
  }
};

function App() {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('rft_engine_stats_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        scores: { ...INITIAL_STATS.scores, ...parsed.scores },
        settings: { ...INITIAL_STATS.settings, ...parsed.settings }
      };
    }
    return INITIAL_STATS;
  });
  
  const [gameStarted, setGameStarted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('rft_engine_stats_v2', JSON.stringify(stats));
  }, [stats]);

  const updateStats = (frame: FrameType, success: boolean) => {
    if (stats.settings.practiceMode) {
       setStats(prev => ({
         ...prev,
         history: [...prev.history, { frame, success, timestamp: Date.now(), isPractice: true }].slice(-100)
       }));
       return;
    }

    setStats(prev => {
      const currentScore = prev.scores[frame];
      const adjustment = success ? 5 : -3;
      const newScore = Math.min(Math.max(currentScore + adjustment, 0), 100);
      
      return {
        ...prev,
        scores: {
          ...prev.scores,
          [frame]: newScore
        },
        history: [...prev.history, { frame, success, timestamp: Date.now() }].slice(-100)
      };
    });
  };

  const updateSettings = (updates: Partial<UserStats['settings']>) => {
    setStats(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  };

  const resetProgress = () => {
    if (confirm("Initiate full memory purge? This will reset all proficiency metrics.")) {
      setStats(INITIAL_STATS);
      setSettingsOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col font-sans selection:bg-blue-500/30 selection:text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-slate-500/5 blur-[150px] rounded-full" />
      </div>

      <nav className="sticky top-0 z-50 glass border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
            <BrainCircuit size={24} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">Relational Engine</span>
        </div>
        
        <div className="flex items-center gap-6">
          {gameStarted && (
            <button 
              onClick={() => setGameStarted(false)}
              className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 tracking-widest uppercase transition-colors"
            >
              <BarChart3 size={16} /> 
              <span className="hidden sm:inline">Profile</span>
            </button>
          )}
          <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-400 tracking-widest uppercase">
            <span className="flex items-center gap-1.5"><Activity size={14} /> System</span>
            <div className="h-1 w-1 bg-slate-600 rounded-full" />
            <span className={stats.settings.practiceMode ? "text-amber-500" : "text-emerald-500"}>
              {stats.settings.practiceMode ? 'Practice Mode' : 'Calibration Mode'}
            </span>
          </div>
          <button 
            onClick={() => setSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </nav>

      {settingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="glass max-w-md w-full rounded-[2.5rem] border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
              <div className="flex items-center gap-3">
                <Settings size={24} className="text-blue-500" />
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">System Configuration</h3>
              </div>
              <button onClick={() => setSettingsOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity size={16} className="text-blue-400" /> Practice Mode
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Disable neural footprinting</p>
                </div>
                <button 
                  onClick={() => updateSettings({ practiceMode: !stats.settings.practiceMode })}
                >
                  {stats.settings.practiceMode ? 
                    <ToggleRight size={36} className="text-blue-500" /> : 
                    <ToggleLeft size={36} className="text-slate-600" />
                  }
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu size={16} className="text-blue-400" /> Relational Mode
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {stats.settings.useNaturalLanguage ? 'Natural Language Cues' : 'Arbitrary Symbols (AARR)'}
                  </p>
                </div>
                <button 
                  onClick={() => updateSettings({ useNaturalLanguage: !stats.settings.useNaturalLanguage })}
                >
                  {stats.settings.useNaturalLanguage ? 
                    <Languages size={24} className="text-blue-400 mr-2" /> : 
                    <Cpu size={24} className="text-blue-500 mr-2" />
                  }
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    Timer
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                    Adaptive latency monitoring
                  </p>
                </div>
                <button 
                  onClick={() => updateSettings({ timerEnabled: !stats.settings.timerEnabled })}
                >
                  {stats.settings.timerEnabled ? 
                    <ToggleRight size={36} className="text-blue-500" /> : 
                    <ToggleLeft size={36} className="text-slate-600" />
                  }
                </button>
              </div>

              <div className="pt-4 space-y-3">
                <div className="text-[10px] font-black text-rose-500/80 uppercase tracking-widest px-1">Danger Zone</div>
                <button 
                  onClick={resetProgress}
                  className="w-full py-4 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-all font-bold text-sm flex items-center justify-center gap-2 group"
                >
                  <Trash2 size={16} className="group-hover:animate-bounce" />
                  Reset Calibration Data
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-900/20">
              <button 
                onClick={() => setSettingsOpen(false)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 relative flex flex-col items-center justify-center p-4 lg:p-8">
        {!gameStarted ? (
          <div className="w-full max-w-5xl animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center gap-12 py-8">
            <div className="text-center space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic">
                Cognitive <span className="text-blue-500">Calibration</span>
              </h1>
              <p className="text-slate-400 text-lg">
                Training Arbitrarily Applicable Relational Responding. 
                Experience Transformation of Function and Deictic Temporal Shifting.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
              <div className="lg:col-span-7 flex flex-col gap-6">
                <StatsPanel stats={stats} />
              </div>
              <div className="lg:col-span-5 flex flex-col justify-center items-center gap-8 bg-slate-900/30 rounded-3xl p-8 border border-white/5 glass">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">Ready for Calibration?</h2>
                  <p className="text-slate-500 text-sm">
                    {stats.settings.useNaturalLanguage 
                      ? "Natural Language mode enabled. Lower cognitive resistance." 
                      : "Arbitrary Symbol mode enabled. High cognitive load."}
                  </p>
                </div>
                
                <button
                  onClick={() => setGameStarted(true)}
                  className={`group relative px-12 py-6 rounded-2xl font-black text-2xl tracking-tight flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-xl ${
                    stats.settings.practiceMode ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40'
                  }`}
                >
                  <Play size={28} className="fill-current" />
                  {stats.settings.practiceMode ? 'START PRACTICE' : 'INITIATE CALIB'}
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all scale-105" />
                </button>

                <div className="flex gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Activity size={12} /> Fluency Protocol</span>
                  <span className="flex items-center gap-1"><BrainCircuit size={12} /> RFT V3.0</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className="w-full max-w-4xl flex items-center justify-between mb-8">
               <button 
                onClick={() => setGameStarted(false)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
               >
                 <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                 <span className="text-sm font-bold uppercase tracking-widest">Abort Session</span>
               </button>
               <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${
                 stats.settings.practiceMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-blue-500/10 border-blue-500/20'
               }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse shadow-sm ${
                    stats.settings.practiceMode ? 'bg-amber-500 shadow-amber-500/50' : 'bg-blue-500 shadow-blue-500/50'
                  }`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    stats.settings.practiceMode ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    {stats.settings.practiceMode ? 'Practice Sequence' : 'Calibration Active'}
                  </span>
               </div>
            </div>
            <GameEngine stats={stats} onUpdateStats={updateStats} />
          </div>
        )}
      </main>

      <footer className="h-10 glass border-t border-white/5 flex items-center px-8 justify-between text-[10px] text-slate-500 font-mono tracking-widest uppercase">
        <div className="flex gap-4">
          <span>Status: {gameStarted ? 'ENGAGED' : 'STANDBY'}</span>
          <span>Version: 3.0.0-RFT</span>
        </div>
        <div className="hidden sm:block">
          &copy; 2025 Relational_Engine // Functional Contextualism
        </div>
      </footer>
    </div>
  );
}

export default App;
