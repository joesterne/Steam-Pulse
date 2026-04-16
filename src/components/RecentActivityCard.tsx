import React from 'react';
import { Game } from '../types';
import { cn } from '../lib/utils';

interface RecentActivityCardProps {
  games: Game[];
  selectedGame: Game | null;
  onSelectGame: (game: Game) => void;
}

export function RecentActivityCard({ games, selectedGame, onSelectGame }: RecentActivityCardProps) {
  return (
    <div className="bento-card col-span-2 row-span-1">
      <span className="card-label">Recent Activity</span>
      <div className="space-y-3 overflow-y-auto max-h-[120px] pr-2 custom-scrollbar">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game)}
            className="w-full flex items-center gap-3 group text-left"
          >
            <div className={cn(
              "w-2 h-2 rounded-full transition-all",
              selectedGame?.id === game.id ? "bg-accent-green scale-125 shadow-[0_0_8px_#a3ff00]" : "bg-text-dim opacity-30"
            )} />
            <span className={cn(
              "text-sm transition-colors",
              selectedGame?.id === game.id ? "text-text-main font-bold" : "text-text-dim group-hover:text-text-main"
            )}>
              Played {game.name}
            </span>
            <span className="ml-auto text-[10px] text-text-dim">
              {game.playtime}h
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
