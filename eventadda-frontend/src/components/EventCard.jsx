import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const CATEGORY_GRADIENTS = {
  tech: 'from-cyan-500 via-blue-600 to-violet-700',
  music: 'from-fuchsia-500 via-rose-500 to-amber-600',
  sports: 'from-emerald-400 via-teal-500 to-blue-600',
  seminar: 'from-violet-600 via-indigo-600 to-cyan-500',
  default: 'from-fuchsia-600 via-violet-600 to-purple-700'
};

const EventCard = ({ event, onWishlistToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const [availableSeats, setAvailableSeats] = useState(event.availableSeats);

  useEffect(() => {
    setAvailableSeats(event.availableSeats);
    
    if (user && user.role === 'PARTICIPANT') {
      api.wishlist.check(event.id)
        .then(res => setWishlisted(res.wishlisted))
        .catch(() => {});
    }
  }, [event, user]);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.wishlist.toggle(event.id);
      setWishlisted(res.wishlisted);
      if (onWishlistToggle) onWishlistToggle(event.id, res.wishlisted);
    } catch (err) {
      console.error(err);
    }
  };

  const getGradient = (cat) => {
    const key = cat ? cat.toLowerCase() : 'default';
    return CATEGORY_GRADIENTS[key] || CATEGORY_GRADIENTS.default;
  };

  const formatEventDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Occupancy percentage
  const occupancyPercent = event.maxSeats > 0 ? ((event.maxSeats - availableSeats) / event.maxSeats) * 100 : 0;

  return (
    <Link 
      to={`/events/${event.id}`}
      className="group block rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-fuchsia-500/25 hover:bg-slate-900/60 shadow-xl hover:shadow-glow-fuchsia overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 relative"
    >
      {/* Banner / Category Banner Glares */}
      <div className="h-40 bg-slate-950 relative flex items-end p-4 overflow-hidden">
        {/* Gradient backdrop fallback */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(event.category)}`}></div>
        {/* Real image banner */}
        {event.bannerImage && (
          <img 
            src={event.bannerImage} 
            alt={event.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
          />
        )}
        {/* Soft backdrop grids */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:14px_14px]"></div>
        
        {/* Wishlist Button (Floating) */}
        {(!user || user.role === 'PARTICIPANT') && (
          <button 
            onClick={handleWishlist}
            className={`absolute top-4 right-4 p-2 rounded-xl border backdrop-blur-md transition-all duration-300 ${
              wishlisted 
                ? 'bg-rose-500/25 border-rose-500/40 text-rose-500 scale-105 shadow-glow-fuchsia' 
                : 'bg-slate-950/50 border-white/10 text-white/80 hover:text-rose-400 hover:bg-slate-950/80'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        )}

        {/* Category Badge */}
        <span className="px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-slate-950/85 text-fuchsia-400 border border-fuchsia-500/20 backdrop-blur-md">
          {event.category || 'Event'}
        </span>
      </div>

      {/* Main Details */}
      <div className="p-5 flex flex-col space-y-4">
        {/* Status Pulse */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-medium font-display">
            Hosted by {event.organizer?.name || 'Organizer'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              event.status === 'UPCOMING' ? 'bg-emerald-400 shadow-glow-emerald' :
              event.status === 'ONGOING' ? 'bg-fuchsia-400 shadow-glow-fuchsia' : 'bg-slate-500'
            }`}></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {event.status}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold font-display text-slate-100 group-hover:text-fuchsia-400 transition-colors line-clamp-1">
          {event.title}
        </h3>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 pb-2 border-b border-slate-800/50">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="line-clamp-1">{formatEventDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
        </div>

        {/* Dynamic Seats Progress Indicator */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">
              {availableSeats} / {event.maxSeats} seats remaining
            </span>
            <span className="text-[10px] text-slate-500">
              {Math.round(occupancyPercent)}% filled
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${occupancyPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Footer Trigger */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-bold bg-slate-950 px-3 py-1 rounded-lg text-emerald-400 border border-emerald-500/10 font-display">
            {event.ticketPrice > 0 ? `₹${event.ticketPrice}` : 'FREE ENTRY'}
          </span>
          <span className="text-xs text-fuchsia-400 font-semibold flex items-center gap-1 hover:gap-1.5 transition-all">
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
