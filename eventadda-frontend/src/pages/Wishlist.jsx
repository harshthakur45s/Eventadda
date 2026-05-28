import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Heart, Layers } from 'lucide-react';
import EventCard from '../components/EventCard';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [wishlistEvents, setWishlistEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const data = await api.wishlist.get();
      setWishlistEvents(data);
    } catch (e) {
      console.error("Failed to load wishlist", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleWishlistToggle = (eventId, isWishlisted) => {
    // If it's removed, filter it out from the display immediately!
    if (!isWishlisted) {
      setWishlistEvents(prev => prev.filter(e => e.id !== eventId));
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-500">Loading your saved events...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 select-none text-left">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-glow-fuchsia animate-pulse">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold font-display text-slate-100">My Saved Wishlist</h1>
          <p className="text-xs text-slate-400 mt-1">Check and monitor bookings for your saved bookmark items</p>
        </div>
      </div>

      {/* Grid listing */}
      {wishlistEvents.length === 0 ? (
        <div className="py-24 text-center glass rounded-2xl border border-slate-905 space-y-4">
          <p className="text-slate-500 text-sm">Your wishlist is currently empty.</p>
          <Link 
            to="/"
            className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl inline-block shadow-lg shadow-fuchsia-600/10"
          >
            Find Live Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onWishlistToggle={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
