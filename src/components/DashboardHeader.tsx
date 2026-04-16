import React from 'react';
import { Search, Sparkles, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardHeaderProps {
  user: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isSearching: boolean;
  searchResults: any[];
  handleSelectSearchResult: (item: any) => void;
  logout: () => void;
}

export function DashboardHeader({
  user,
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
  searchResults,
  handleSelectSearchResult,
  logout
}: DashboardHeaderProps) {
  return (
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
                  className="w-full flex items-center gap-4 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0 group"
                >
                  <img src={item.tiny_image} alt={item.name} className="w-20 h-10 object-cover rounded-lg border border-white/5" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-accent transition-colors">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-dim px-1.5 py-0.5 bg-white/5 rounded uppercase tracking-wider">Steam</span>
                      <p className="text-[10px] text-accent font-medium">{item.price ? item.price.final_formatted : 'Free'}</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    <Sparkles size={14} className="text-accent" />
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
  );
}
