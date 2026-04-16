import React, { useState, useEffect } from 'react';
import { useAuth } from './lib/AuthContext';
import { db, OperationType, handleFirestoreError } from './lib/firebase';
import { collection, query, onSnapshot, doc, setDoc, getDocFromServer } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Gamepad2, User as UserIcon } from 'lucide-react';
import { getSoundtrackRecommendations, generateMusicClip } from './lib/gemini';

import debounce from 'lodash.debounce';
import Fuse from 'fuse.js';

// Refactored Components
import { DashboardHeader } from './components/DashboardHeader';
import { ActiveMissionCard } from './components/ActiveMissionCard';
import { SoundtrackCard } from './components/SoundtrackCard';
import { StatCard } from './components/StatCard';
import { RecentActivityCard } from './components/RecentActivityCard';
import { RecommendationsGrid } from './components/RecommendationsGrid';

// Constants and Types
import { MOCK_GAMES } from './constants';
import { Game, Recommendation } from './types';

export default function App() {
  const { user, loading, signIn, logout } = useAuth();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [gameNotes, setGameNotes] = useState<Record<string, string>>({});
  const [currentNote, setCurrentNote] = useState('');
  
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Debounced search function
  const debouncedFetch = React.useMemo(
    () =>
      debounce(async (term: string) => {
        if (!term.trim()) {
          setSearchResults([]);
          return;
        }

        setIsSearching(true);
        try {
          const response = await fetch(`/api/steam/search?term=${encodeURIComponent(term)}`);
          const data = await response.json();
          
          let results = data.items || [];
          
          // Fuzzy refinement (local)
          if (results.length > 0) {
            const fuse = new Fuse(results, {
              keys: ['name'],
              threshold: 0.4,
            });
            const fuzzyResults = fuse.search(term).map(r => r.item);
            // Combine API order with fuzzy refinement for best results
            results = [...new Set([...fuzzyResults, ...results])].slice(0, 8);
          }
          
          setSearchResults(results);
        } catch (error) {
          console.error("Search error", error);
        } finally {
          setIsSearching(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    debouncedFetch(searchQuery);
    return () => debouncedFetch.cancel();
  }, [searchQuery, debouncedFetch]);

  // Load notes from Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'gameNotes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes: Record<string, string> = {};
      snapshot.forEach((doc) => {
        if (doc.data().userId === user.uid) {
          notes[doc.data().gameId] = doc.data().note;
        }
      });
      setGameNotes(notes);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gameNotes');
    });
    return () => unsubscribe();
  }, [user]);

  // Update local note when game changes
  useEffect(() => {
    if (selectedGame) {
      setCurrentNote(gameNotes[selectedGame.id] || '');
    }
  }, [selectedGame, gameNotes]);

  const handleSaveNote = async () => {
    if (!user || !selectedGame) return;
    try {
      await setDoc(doc(db, 'gameNotes', `${user.uid}_${selectedGame.id}`), {
        userId: user.uid,
        gameId: selectedGame.id,
        note: currentNote,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'gameNotes');
    }
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSelectSearchResult = (item: any) => {
    const newGame: Game = {
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

  const handleGetRecommendations = async (game: Game) => {
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
      audio.volume = volume;
      audio.onended = () => setIsPlaying(false);
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.onloadedmetadata = () => setDuration(audio.duration);
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

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioElement) {
      audioElement.volume = newVolume;
    }
  };

  const handleSeek = (time: number) => {
    if (audioElement) {
      audioElement.currentTime = time;
      setCurrentTime(time);
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
      <DashboardHeader 
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        isSearching={isSearching}
        searchResults={searchResults}
        handleSelectSearchResult={handleSelectSearchResult}
        logout={logout}
      />

      <div className="bento-grid flex-grow">
        <ActiveMissionCard 
          selectedGame={selectedGame}
          currentNote={currentNote}
          setCurrentNote={setCurrentNote}
          handleSaveNote={handleSaveNote}
        />

        <SoundtrackCard 
          selectedGame={selectedGame}
          isPlaying={isPlaying}
          isGenerating={isGenerating}
          recommendations={recommendations}
          audioUrl={audioUrl}
          togglePlayback={togglePlayback}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />

        <StatCard label="Total Legacy" value="4,120" sublabel="HOURS ON STEAM" />
        <StatCard label="Service Level" value="124" sublabel="GAMES OWNED" />

        <RecentActivityCard 
          games={MOCK_GAMES}
          selectedGame={selectedGame}
          onSelectGame={handleGetRecommendations}
        />

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

        <StatCard label="Global Rank" value="#1,402" sublabel="IN REGION" accent={false} />
      </div>

      <RecommendationsGrid recommendations={recommendations} />
    </div>
  );
}
