import { Game } from './types';

export const MOCK_GAMES: Game[] = [
  { 
    id: '570', 
    name: 'Dota 2', 
    playtime: 2450, 
    lastPlayed: '2024-04-14T20:00:00Z', 
    image: 'https://picsum.photos/seed/dota2/400/225',
    achievements: { earned: 12, total: 12 },
    description: "A modern multiplayer masterpiece of strategy and skill."
  },
  { 
    id: '730', 
    name: 'Counter-Strike 2', 
    playtime: 1200, 
    lastPlayed: '2024-04-15T10:00:00Z', 
    image: 'https://picsum.photos/seed/cs2/400/225',
    achievements: { earned: 1, total: 1 },
    description: "The next era of Counter-Strike is here."
  },
  { 
    id: '1091500', 
    name: 'Cyberpunk 2077', 
    playtime: 150, 
    lastPlayed: '2024-04-10T15:30:00Z', 
    image: 'https://picsum.photos/seed/cyberpunk/400/225',
    achievements: { earned: 44, total: 57 },
    description: "An open-world, action-adventure story set in Night City."
  },
  { 
    id: '1245620', 
    name: 'Elden Ring', 
    playtime: 320, 
    lastPlayed: '2024-04-12T22:15:00Z', 
    image: 'https://picsum.photos/seed/eldenring/400/225',
    achievements: { earned: 32, total: 42 },
    description: "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring."
  },
];
