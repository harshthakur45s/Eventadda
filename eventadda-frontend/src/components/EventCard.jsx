import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const CATEGORY_BG = {
  tech: 'bg-zinc-900',
  music: 'bg-zinc-900',
  sports: 'bg-zinc-900',
  seminar: 'bg-zinc-900',
  default: 'bg-zinc-900'
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

  const getBgClass = (cat) => {
    const key = cat ? cat.toLowerCase() : 'default';
    return CATEGORY_BG[key] || CATEGORY_BG.default;
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
      className="group block rounded-2xl bg-slate-900/30 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 relative"
    >
      {/* Banner */}
      <div className="h-40 bg-slate-950 relative flex items-end p-4 overflow-hidden">
        {/* Minimalist fallback */}
        <div className={`absolute inset-0 ${getBgClass(event.category)}`}></div>
        {/* Real image banner */}
        {event.bannerImage && (
          <img 
            src={event.bannerImage} 
            alt={event.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-[1.03] transition-transform duration-500" 
          />
        )}
        
        {/* Wishlist Button (Floating) */}
        {(!user || user.role === 'PARTICIPANT') && (
          <button 
            onClick={handleWishlist}
            className={`absolute top-4 right-4 p-2 rounded-xl border backdrop-blur-md transition-all duration-300 ${
              wishlisted 
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-500 scale-105' 
                : 'bg-slate-950/60 border-white/10 text-white/80 hover:text-rose-450 hover:bg-slate-950/90'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        )}

        {/* Category Badge */}
        <span className="px-2.5 py-1 rounded-lg text-[9px] font-semibold tracking-wider uppercase bg-slate-950/90 text-slate-300 border border-slate-800 backdrop-blur-md">
          {event.category || 'Event'}
        </span>
      </div>

      {/* Main Details */}
      <div className="p-5 flex flex-col space-y-4">
        {/* Status Pulse */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-medium">
            Hosted by {event.organizer?.name || 'Organizer'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              event.status === 'UPCOMING' ? 'bg-emerald-400' :
              event.status === 'ONGOING' ? 'bg-slate-350' : 'bg-slate-600'
            }`}></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {event.status}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-100 group-hover:text-white transition-colors line-clamp-1">
          {event.title}
        </h3>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 pb-2 border-b border-slate-800/40">
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
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-slate-300 rounded-full transition-all duration-500"
              style={{ width: `${occupancyPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Footer Trigger */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-semibold bg-slate-950 px-2.5 py-1 rounded-lg text-slate-200 border border-slate-800">
            {event.ticketPrice > 0 ? `₹${event.ticketPrice}` : 'FREE ENTRY'}
          </span>
          <span className="text-xs text-slate-300 font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
            View Details <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
