import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { Search, Sparkles, SlidersHorizontal, Layers, Sparkle } from 'lucide-react';

const CATEGORIES = ['All', 'Tech', 'Music', 'Sports', 'Seminar'];

const Home = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const categoryFilter = selectedCategory === 'All' ? '' : selectedCategory;
      const data = await api.events.getAll(searchQuery, categoryFilter);
      setEvents(data);
    } catch (e) {
      console.error("Failed to load events", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (user && user.role === 'PARTICIPANT') {
      try {
        const data = await api.recommendations.get();
        setRecommendations(data);
      } catch (e) {
        console.error("Failed to load AI recommendations", e);
      }
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 select-none">
      {/* Hero Showcase Section */}
      <div className="rounded-3xl bg-slate-900/30 border border-slate-800 p-8 md:p-12 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
            Welcome to Event Adda
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight text-slate-100">
            Unite, Experience & <br />
            Share Incredible Events
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            The minimalist hub where organizers host premium seminars, workshops, and sports matches, and participants join with a simple approval.
          </p>

          {/* Interactive Filters Panel */}
          <div className="max-w-xl mx-auto flex items-center gap-3 bg-slate-900/40 border border-slate-800 p-2 rounded-2xl focus-within:border-slate-700 transition-all">
            <div className="flex-1 flex items-center gap-2 pl-3">
              <Search className="w-4.5 h-4.5 text-slate-550" />
              <input 
                type="text" 
                placeholder="Search events, venues, topics..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-0"
              />
            </div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-400 cursor-pointer hover:bg-slate-850 transition-colors">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Section (Participant Only) */}
      {user && user.role === 'PARTICIPANT' && recommendations.length > 0 && (
        <div className="space-y-6 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-100 flex items-center gap-1.5">
                AI Recommendations
              </h2>
              <p className="text-xs text-slate-450">Based on events you previously registered for</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Browse Events Section */}
      <div className="space-y-6 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-bold font-display text-slate-100">Browse Live Events</h2>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-slate-100 border-slate-100 text-slate-950 shadow-sm'
                    : 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-905'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listing Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-900/20 border border-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="py-24 text-center glass rounded-2xl border border-slate-900">
            <p className="text-slate-500 text-sm">No live events found matching your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
