import React, { useState } from 'react';
import { Gamepad2, Trophy, TrendingUp, Clock, History, StickyNote, Save, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Game } from '../types';
import { formatDate, calculateCompletion } from '../lib/utils';

interface ActiveMissionCardProps {
  selectedGame: Game | null;
  currentNote: string;
  setCurrentNote: (note: string) => void;
  handleSaveNote: () => Promise<void>;
}

export function ActiveMissionCard({
  selectedGame,
  currentNote,
  setCurrentNote,
  handleSaveNote
}: ActiveMissionCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const onSave = async () => {
    setIsSaving(true);
    await handleSaveNote();
    setIsSaving(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="bento-card col-span-2 row-span-2 bg-[#1b2838] border-accent/20 overflow-hidden relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 10, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="absolute top-0 left-1/2 z-50 bg-accent-green text-bg px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg shadow-accent-green/20"
          >
            <CheckCircle2 size={14} />
            Mission Log Updated
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Image Effect */}
      {selectedGame && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.img
            key={selectedGame.image}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.3, scale: 1 }}
            src={selectedGame.image}
            className="w-full h-full object-cover blur-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b2838]/90 via-[#1b2838]/60 to-[#171a21]/90" />
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full w-full">
        <span className="card-label">Active Mission</span>
        {selectedGame ? (
          <>
            <h2 className="text-3xl font-extrabold mt-2 leading-tight drop-shadow-sm">{selectedGame.name}</h2>
            <p className="text-text-dim mt-3 text-sm leading-relaxed drop-shadow-sm">
              {selectedGame.description}
            </p>
            <div className="mt-auto pt-6 border-t border-white/5">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-text-dim text-[10px] uppercase tracking-wider mb-1">
                  <Trophy size={12} className="text-accent" />
                  Achievements
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold">{selectedGame.achievements.earned}</span>
                  <span className="text-xs text-text-dim">/ {selectedGame.achievements.total}</span>
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-text-dim text-[10px] uppercase tracking-wider mb-1">
                  <TrendingUp size={12} className="text-accent-green" />
                  Completion
                </div>
                <div className="text-xl font-bold">
                  {calculateCompletion(selectedGame.achievements.earned, selectedGame.achievements.total)}%
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="progress-bar-bg !my-0">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateCompletion(selectedGame.achievements.earned, selectedGame.achievements.total)}%` }}
                  className="progress-bar-fill" 
                />
              </div>
              <div className="flex justify-between text-[11px] text-text-dim">
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {selectedGame.playtime} Hours Logged
                </span>
                <span className="flex items-center gap-1">
                  <History size={10} />
                  Last played {formatDate(selectedGame.lastPlayed)}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-text-dim text-[10px] uppercase tracking-wider mb-3">
                <StickyNote size={12} className="text-accent" />
                Personal Mission Notes
              </div>
              <div className="relative group">
                <textarea 
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="Add strategies, goals, or reminders..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs min-h-[80px] focus:outline-none focus:border-accent/50 transition-all resize-none pr-10"
                />
                <button 
                  onClick={onSave}
                  disabled={isSaving}
                  className="absolute right-2 bottom-2 p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-bg transition-all opacity-0 group-focus-within:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Save Note"
                >
                  {isSaving ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <Save size={14} />
                    </motion.div>
                  ) : (
                    <Save size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
          <Gamepad2 size={48} className="mb-4" />
          <p className="text-sm">Select a game to view progress</p>
        </div>
      )}
      </div>
    </div>
  );
}
