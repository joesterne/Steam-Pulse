import React, { useState, useEffect } from 'react';
import { useAuth } from './lib/AuthContext';
import { db, OperationType, handleFirestoreError } from './lib/firebase';
import { collection, query, onSnapshot, doc, setDoc, getDocFromServer } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Music, 
  History, 
  Play, 
  Pause, 
  LogOut, 
  User as UserIcon,
  Sparkles,
  Search,
  Mic,
  Volume2,
  Clock,
  TrendingUp
} from 'lucide-react';
import { getSoundtrackRecommendations, generateMusicClip } from './lib/gemini';
import { cn } from './lib/utils';

// Mock Steam Data for Demo (In a real app, this would come from Steam API)
const MOCK_GAMES = [
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

export default function App() {
  const { user, loading, signIn, logout } = useAuth();
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateCompletion = (earned: number, total: number) => {
    return Math.round((earned / total) * 100);
  };

  // Test Connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/steam/search?term=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error("Search error", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: any) => {
    const newGame = {
      id: item.id.toString(),
      name: item.name,
      playtime: 0,
      lastPlayed: new Date().toISOString(),
      image: item.tiny_image || `https://picsum.photos/seed/${item.id}/400/225`,
      achievements: { earned: 0, total: 10 },
      description: `Discovered via search. A game from Steam's library.`
    };
    handleGetRecommendations(newGame);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleGetRecommendations = async (game: any) => {
    setSelectedGame(game);
    setIsGenerating(true);
    setRecommendations([]);
    setAudioUrl(null);
    
    try {
      const recs = await getSoundtrackRecommendations(game.name);
      setRecommendations(recs);
      
      const clip = await generateMusicClip(`A 30-second atmospheric soundtrack inspired by the game ${game.name}.`);
      if (clip) setAudioUrl(clip);
    } catch (error) {
      console.error("Error generating recommendations", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;
    
    if (!audioElement) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-accent"
        >
          <Gamepad2 size={64} />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="mb-8 inline-block p-4 bg-card-bg border border-border rounded-3xl shadow-2xl">
            <Gamepad2 size={80} className="text-accent" />
          </div>
          <h1 className="text-5xl font-display font-extrabold mb-4 tracking-tight text-text-main">Steam Pulse</h1>
          <p className="text-text-dim text-lg mb-8 leading-relaxed">
            Your ultimate gaming companion. Track playtime, get AI-powered soundtrack recommendations, and generate custom music for your sessions.
          </p>
          <button 
            onClick={signIn}
            className="w-full py-4 px-8 bg-accent hover:bg-white text-bg font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-accent/20"
          >
            <UserIcon size={20} />
            Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col p-6 max-w-[1200px] mx-auto overflow-x-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <img 
            src={user.photoURL || ''} 
            alt="Profile" 
            className="w-12 h-12 rounded-xl border border-border"
            referrerPolicy="no-referrer"
          />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold">{user.displayName}</h1>
            <span className="text-[11px] uppercase tracking-[1px] text-accent-green font-bold flex items-center gap-1">
              <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
              Online & Playing
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Steam games..."
              className="w-full bg-card-bg border border-border rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-accent transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
            {isSearching && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-accent"
              >
                <Sparkles size={16} />
              </motion.div>
            )}
          </form>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 w-full mt-2 bg-card-bg border border-border rounded-2xl shadow-2xl z-[100] overflow-hidden max-h-[400px] overflow-y-auto"
              >
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full flex items-center gap-4 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                  >
                    <img src={item.tiny_image} alt={item.name} className="w-12 h-6 object-cover rounded" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{item.name}</p>
                      <p className="text-[10px] text-text-dim">{item.price ? item.price.final_formatted : 'Free'}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={logout}
          className="px-4 py-2 border border-accent text-accent rounded-full text-xs font-bold hover:bg-accent hover:text-bg transition-all flex items-center gap-2 shrink-0"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">LOGOUT</span>
        </button>
      </header>

      <div className="bento-grid flex-grow">
        {/* Hero Card: Active Game */}
        <div className="bento-card col-span-2 row-span-2 bg-gradient-to-br from-[#1b2838] to-[#171a21] border-accent/20">
          <span className="card-label">Active Mission</span>
          {selectedGame ? (
            <>
              <h2 className="text-3xl font-extrabold mt-2 leading-tight">{selectedGame.name}</h2>
              <p className="text-text-dim mt-3 text-sm leading-relaxed">
                {selectedGame.description}
              </p>
              <div className="mt-auto">
                <div className="flex justify-between text-sm text-text-dim mb-1">
                  <span>Completion</span>
                  <span>{calculateCompletion(selectedGame.achievements.earned, selectedGame.achievements.total)}%</span>
                </div>
                <div className="progress-bar-bg">
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
                <div className="mt-2 text-[11px] text-accent font-bold uppercase tracking-wider">
                  {selectedGame.achievements.earned} / {selectedGame.achievements.total} Achievements Unlocked
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

        {/* Soundtrack Card */}
        <div className="bento-card col-span-2 row-span-1 bg-gradient-to-r from-card-bg to-[#2d1b38]">
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
              <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-2xl border border-white/10">
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
                <button 
                  onClick={togglePlayback}
                  className="p-3 bg-accent text-bg rounded-full hover:scale-110 transition-transform"
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-dim italic">No active soundtrack</p>
          )}
        </div>

        {/* Stat Card: Total Playtime */}
        <div className="bento-card col-span-1 row-span-1 items-center justify-center text-center">
          <span className="card-label">Total Legacy</span>
          <div className="text-3xl font-extrabold text-accent">4,120</div>
          <div className="text-[10px] text-text-dim mt-1 uppercase tracking-wider">HOURS ON STEAM</div>
        </div>

        {/* Stat Card: Games Owned */}
        <div className="bento-card col-span-1 row-span-1 items-center justify-center text-center">
          <span className="card-label">Service Level</span>
          <div className="text-3xl font-extrabold text-accent">124</div>
          <div className="text-[10px] text-text-dim mt-1 uppercase tracking-wider">GAMES OWNED</div>
        </div>

        {/* Recent Activity: Game List */}
        <div className="bento-card col-span-2 row-span-1">
          <span className="card-label">Recent Activity</span>
          <div className="space-y-3 overflow-y-auto max-h-[120px] pr-2 custom-scrollbar">
            {MOCK_GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => handleGetRecommendations(game)}
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

        {/* Genre Breakdown */}
        <div className="bento-card col-span-1 row-span-1">
          <span className="card-label">Genre DNA</span>
          <div className="space-y-2">
            {[
              { label: 'Soulslike', val: '42%' },
              { label: 'RPG', val: '28%' },
              { label: 'Strategy', val: '15%' }
            ].map((g, i) => (
              <div key={i} className="flex justify-between text-xs pb-2 border-b border-white/5">
                <span className="text-text-dim">{g.label}</span>
                <span className="text-accent font-bold">{g.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Rank */}
        <div className="bento-card col-span-1 row-span-1 items-center justify-center text-center">
          <span className="card-label">Global Rank</span>
          <div className="text-2xl font-extrabold text-text-main">#1,402</div>
          <div className="text-[10px] text-text-dim mt-1 uppercase tracking-wider">IN REGION</div>
        </div>
      </div>

      {/* Recommendations Detail (Floating or Bottom) */}
      <AnimatePresence>
        {recommendations.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {recommendations.slice(1, 5).map((rec, i) => (
              <div key={i} className="bento-card !p-4">
                <h4 className="font-bold text-sm truncate">{rec.title}</h4>
                <p className="text-[10px] text-text-dim mb-2">{rec.artist}</p>
                <p className="text-[10px] text-text-dim italic line-clamp-2">"{rec.reason}"</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
