import React from 'react';
import { Music, Sparkles, Play, Pause, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Game, Recommendation } from '../types';
import { formatTime } from '../lib/utils';

interface SoundtrackCardProps {
  selectedGame: Game | null;
  isPlaying: boolean;
  isGenerating: boolean;
  recommendations: Recommendation[];
  audioUrl: string | null;
  togglePlayback: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function SoundtrackCard({
  selectedGame,
  isPlaying,
  isGenerating,
  recommendations,
  audioUrl,
  togglePlayback,
  volume,
  onVolumeChange,
  currentTime,
  duration,
  onSeek
}: SoundtrackCardProps) {
  return (
    <div className="bento-card col-span-2 row-span-1 bg-gradient-to-r from-card-bg to-[#2d1b38] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="card-label">Adaptive Soundtrack</span>
          {isPlaying && (
            <div className="visualizer">
              <motion.div animate={{ height: [12, 18, 10, 14] }} transition={{ repeat: Infinity, duration: 0.5 }} className="vis-bar" />
              <motion.div animate={{ height: [18, 10, 14, 12] }} transition={{ repeat: Infinity, duration: 0.6 }} className="vis-bar" />
              <motion.div animate={{ height: [14, 12, 18, 10] }} transition={{ repeat: Infinity, duration: 0.4 }} className="vis-bar" />
              <motion.div animate={{ height: [10, 14, 12, 18] }} transition={{ repeat: Infinity, duration: 0.7 }} className="vis-bar" />
            </div>
          )}
        </div>
        
        {selectedGame ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-2xl border border-white/10 shrink-0">
              {isGenerating ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                  <Sparkles size={24} className="text-accent" />
                </motion.div>
              ) : (
                <Music size={24} className="text-accent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold truncate">
                {recommendations.length > 0 ? recommendations[0].title : "AI Recommendations"}
              </h3>
              <p className="text-text-dim text-xs truncate">
                {recommendations.length > 0 ? recommendations[0].artist : "Select a game to generate"}
              </p>
            </div>
            {audioUrl && (
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                  <Volume2 size={14} className="text-text-dim" />
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>
                <button 
                  onClick={togglePlayback}
                  className="p-3 bg-accent text-bg rounded-full hover:scale-110 transition-transform shadow-lg shadow-accent/20"
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-dim italic">No active soundtrack</p>
        )}
      </div>

      {audioUrl && selectedGame && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-text-dim w-8">{formatTime(currentTime)}</span>
            <input 
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-green"
            />
            <span className="text-[10px] font-mono text-text-dim w-8 text-right">{formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
