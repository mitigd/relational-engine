
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FrameType, type Challenge, type UserStats } from '../types';
import { generateChallenge, ARBITRARY_CUES } from '../services/engine';
import { FRAME_ICONS } from '../constants';
import { ArrowRight, CheckCircle, XCircle, ChevronRight, RefreshCw, Timer, Hash, BookOpen } from 'lucide-react';

interface GameEngineProps {
  stats: UserStats;
  onUpdateStats: (frame: FrameType, success: boolean) => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ stats, onUpdateStats }) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimeout, setIsTimeout] = useState(false);
  
  const nextTimeoutRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const scoresRef = useRef(stats.scores);
  const settingsRef = useRef(stats.settings);

  useEffect(() => {
    scoresRef.current = stats.scores;
    settingsRef.current = stats.settings;
  }, [stats.scores, stats.settings]);

  const { practiceMode, timerEnabled, useNaturalLanguage } = stats.settings;

  const nextChallenge = useCallback(() => {
    if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    const frames = Object.values(FrameType);
    const randomFrame = frames[Math.floor(Math.random() * frames.length)];
    const difficulty = scoresRef.current[randomFrame] || 10;
    
    const newChallenge = generateChallenge(randomFrame, difficulty, settingsRef.current.useNaturalLanguage);
    
    setChallenge(newChallenge);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setIsTimeout(false);

    let calculatedDuration = 35;
    if (difficulty <= 70) {
      calculatedDuration = 35 + Math.floor((difficulty - 10) * 0.416);
    } else {
      calculatedDuration = 60 - Math.floor((difficulty - 70) * 1.0);
    }
    setTimeLeft(Math.max(30, calculatedDuration));
  }, []);

  const handleTimeout = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsAnswered(true);
    setIsCorrect(false);
    setIsTimeout(true);
    setSelectedOption("TIME EXPIRED");
    onUpdateStats(challenge!.frame, false);
  }, [challenge, onUpdateStats]);

  useEffect(() => {
    nextChallenge();
    return () => {
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [nextChallenge]); 

  useEffect(() => {
    if (timerEnabled && !practiceMode && !isAnswered && challenge) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerEnabled, practiceMode, isAnswered, challenge, handleTimeout]);

  const handleSelect = (option: string) => {
    if (!challenge || isAnswered) return;
    
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setSelectedOption(option);
    const correct = option === challenge.correctAnswer;
    setIsAnswered(true);
    setIsCorrect(correct);
    
    onUpdateStats(challenge.frame, correct);

    if (correct) {
      nextTimeoutRef.current = window.setTimeout(() => {
        nextChallenge();
      }, 600); 
    }
  };

  if (!challenge) return null;

  const timerColor = timeLeft < 15 ? 'text-rose-500' : timeLeft < 30 ? 'text-amber-500' : 'text-blue-400';

  const activeCues = !useNaturalLanguage ? Object.entries(ARBITRARY_CUES).filter(([meaning, cue]) => {
    const inPremises = challenge.premises.some(p => p.includes(cue));
    const inQuestion = challenge.question.includes(cue);
    const isAnswer = challenge.correctAnswer === cue;
    const inOptions = challenge.options.some(o => o === cue);
    return inPremises || inQuestion || isAnswer || inOptions;
  }) : [];

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full pb-12 relative">
      {activeCues.length > 0 && (
        <div className="bg-slate-900/60 border border-blue-500/30 rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">
            <BookOpen size={14} /> Active Decoder
          </div>
          <div className="flex flex-wrap gap-3">
            {activeCues.map(([meaning, cue]) => (
              <div key={cue} className="flex items-center gap-3 bg-slate-800/40 px-3 py-2 rounded-xl border border-white/5 transition-all">
                <span className="text-blue-400 font-black text-sm mono tracking-tighter">{cue}</span>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-tight">{meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border transition-all duration-200 ${isAnswered ? (isCorrect ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-rose-500 border-rose-400 text-white') : 'bg-blue-500/20 border-blue-500/30 text-blue-400'}`}>
            {isAnswered && isCorrect ? <CheckCircle size={20} /> : isAnswered && !isCorrect ? <XCircle size={20} /> : FRAME_ICONS[challenge.frame]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">{challenge.frame}</h2>
              {practiceMode && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[8px] font-black text-slate-400 uppercase tracking-widest border border-white/5">Practice</span>
              )}
            </div>
          </div>
        </div>
        
        {timerEnabled && !practiceMode && (
          <div className={`flex flex-col items-end gap-0.5 font-mono ${timerColor}`}>
            <div className="flex items-center gap-2 font-black">
               <Timer size={18} className={timeLeft < 15 ? 'animate-pulse' : ''} />
               <span className="text-xl tabular-nums">{timeLeft}s</span>
            </div>
          </div>
        )}
      </div>

      <div className={`glass rounded-[2rem] p-8 border-t transition-all duration-200 shadow-2xl space-y-8 ${isAnswered && !isCorrect ? 'border-rose-500/30 ring-1 ring-rose-500/20' : 'border-white/5'}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-400/80 uppercase tracking-[0.2em]">
            <Hash size={14} /> Network State
          </div>
          <div className="space-y-2">
            {challenge.premises.map((p, i) => (
              <div key={i} className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                <span className="text-slate-200 font-mono text-lg uppercase tracking-tight">{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400/80 uppercase tracking-[0.2em]">
            <ChevronRight size={14} /> Target Inference
          </div>
          <p className="text-3xl font-black text-white leading-tight tracking-tighter mono">{challenge.question}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {challenge.options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            disabled={isAnswered}
            className={`
              relative group overflow-hidden p-6 rounded-2xl text-left transition-all duration-150 border-2
              ${isAnswered && option === challenge.correctAnswer ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : ''}
              ${isAnswered && option === selectedOption && option !== challenge.correctAnswer ? 'bg-rose-500/20 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : ''}
              ${!isAnswered && selectedOption === option ? 'bg-blue-500/10 border-blue-500' : 'bg-slate-800/20 border-white/5 hover:border-slate-500/50'}
              ${isAnswered && option !== challenge.correctAnswer && option !== selectedOption ? 'opacity-30 grayscale-[0.5]' : 'opacity-100'}
              ${isAnswered ? 'cursor-default' : 'hover:scale-[1.01] active:scale-[0.99]'}
            `}
          >
            <div className="flex items-center justify-between z-10 relative">
              <span className={`text-xl font-black mono transition-colors duration-150 uppercase tracking-tighter ${isAnswered && option === challenge.correctAnswer ? 'text-emerald-400' : 'text-slate-300'}`}>
                {option}
              </span>
              {isAnswered && option === challenge.correctAnswer && (
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400">
                  PASS
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {isAnswered && !isCorrect && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="glass max-w-lg w-full rounded-[2.5rem] p-8 md:p-10 border-rose-500/30 shadow-2xl flex flex-col gap-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/20">
                {isTimeout ? <Timer size={48} className="animate-pulse" /> : <XCircle size={48} />}
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                  {isTimeout ? "Neural Latency Spike" : "Incoherent Responding"}
                </h3>
              </div>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/5 space-y-6">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Mastery Breakdown</div>
                <p className="text-slate-300 italic text-sm leading-relaxed">
                  "{challenge.explanation}"
                </p>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase">
                <span>Correct Mapping:</span>
                <span className="font-black">{challenge.correctAnswer}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsAnswered(false);
                nextChallenge();
              }}
              className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xl uppercase tracking-tight hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              Restart Calibration <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
