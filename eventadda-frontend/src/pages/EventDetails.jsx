import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Calendar, MapPin, Layers, Users, Heart, Star, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const CATEGORY_GRADIENTS = {
  tech: 'from-cyan-500 to-indigo-700',
  music: 'from-fuchsia-500 to-purple-700',
  sports: 'from-emerald-500 to-rose-700',
  seminar: 'from-violet-600 to-indigo-700',
  default: 'from-fuchsia-600 to-purple-700'
};

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myRegistration, setMyRegistration] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [availableSeats, setAvailableSeats] = useState(0);
  
  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const stompClientRef = useRef(null);

  const fetchEventData = async () => {
    try {
      const eventData = await api.events.getById(id);
      setEvent(eventData);
      setAvailableSeats(eventData.availableSeats);

      const reviewsList = await api.reviews.getByEvent(id);
      setReviews(reviewsList);

      if (user) {
        if (user.role === 'PARTICIPANT') {
          // Check registration
          const regs = await api.registrations.getParticipantRegistrations();
          const match = regs.find(r => r.event.id === eventData.id);
          setMyRegistration(match || null);

          // Check wishlist
          const wish = await api.wishlist.check(id);
          setWishlisted(wish.wishlisted);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEventData();

    // WebSocket Seat Listener
    let socket;
    let stompClient;
    try {
      socket = new SockJS('http://localhost:8082/ws');
      stompClient = Stomp.over(socket);
      stompClient.debug = () => {};
      stompClientRef.current = stompClient;

      stompClient.connect({}, () => {
        stompClient.subscribe(`/topic/events/${id}/seats`, (message) => {
          const newSeats = parseInt(message.body, 10);
          setAvailableSeats(newSeats);
        });
      });
    } catch (e) {
      console.warn("WebSocket seat connection failed", e);
    }

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [id, user]);

  const handleJoinRequest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setJoinLoading(true);
    try {
      const reg = await api.registrations.joinRequest(id);
      setMyRegistration(reg);
    } catch (err) {
      alert(err.message);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.wishlist.toggle(id);
      setWishlisted(res.wishlisted);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      const rev = await api.reviews.add({ eventId: event.id, rating, comment });
      setReviews(prev => [...prev, rev]);
      setComment('');
      setRating(5);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    }
  };

  if (!event) {
    return <div className="py-24 text-center text-slate-500">Loading event details...</div>;
  }

  const getGradient = (cat) => {
    const key = cat ? cat.toLowerCase() : 'default';
    return CATEGORY_GRADIENTS[key] || CATEGORY_GRADIENTS.default;
  };

  const occupancyPercent = event.maxSeats > 0 ? ((event.maxSeats - availableSeats) / event.maxSeats) * 100 : 0;
  const isCompleted = event.status === 'COMPLETED' || new Date(event.date) < new Date();
  const canReview = user && user.role === 'PARTICIPANT' && myRegistration && myRegistration.status === 'ACCEPTED' && isCompleted;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 select-none text-left">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-fuchsia-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>

      {/* Main Header / Banner Grid */}
      <div className="rounded-3xl bg-slate-950 p-8 md:p-12 relative overflow-hidden shadow-2xl min-h-[260px] flex flex-col justify-end border border-white/5">
        {/* Gradient backdrop fallback */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(event.category)}`}></div>
        {/* Real image banner */}
        {event.bannerImage && (
          <img 
            src={event.bannerImage} 
            alt={event.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-50" 
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

        {/* Floating Controls */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          {(!user || user.role === 'PARTICIPANT') && (
            <button 
              onClick={handleWishlist}
              className={`p-2.5 rounded-xl border backdrop-blur-md transition-all duration-300 ${
                wishlisted 
                  ? 'bg-rose-500/25 border-rose-500/40 text-rose-500 scale-105 shadow-glow-fuchsia' 
                  : 'bg-slate-950/50 border-white/10 text-white/80 hover:text-rose-400'
              }`}
            >
              <Heart className="w-5 h-5 fill-current" />
            </button>
          )}
        </div>

        {/* Banner Details */}
        <div className="space-y-4 relative">
          <span className="px-3 py-1 rounded-lg text-xs font-bold tracking-widest uppercase bg-slate-950/85 text-fuchsia-400 border border-fuchsia-500/20 backdrop-blur-md inline-block">
            {event.category || 'Seminar'}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-display leading-tight text-white">
            {event.title}
          </h1>
          <p className="text-xs text-slate-300">
            Hosted by <span className="font-bold text-slate-100">{event.organizer?.name}</span> ({event.organizer?.email})
          </p>
        </div>
      </div>

      {/* Main Info Blocks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Description & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Details Box */}
          <div className="glass rounded-2xl p-6 border border-slate-905 space-y-4">
            <h2 className="text-lg font-bold font-display text-slate-200">About the Event</h2>
            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
              {event.description || 'No description provided by the organizer.'}
            </p>
          </div>

          {/* Reviews Area */}
          <div className="glass rounded-2xl p-6 border border-slate-905 space-y-6">
            <h2 className="text-lg font-bold font-display text-slate-200 flex items-center gap-2">
              <Star className="w-5 h-5 text-fuchsia-400 fill-current" /> Ratings & Feedback ({reviews.length})
            </h2>

            {/* Write Review Box */}
            {canReview && (
              <form onSubmit={handleReviewSubmit} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Leave Your Rating</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className="text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${n <= rating ? 'fill-current' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <textarea
                    required
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience at this event..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-fuchsia-500/40"
                  ></textarea>
                </div>

                {reviewError && <p className="text-[10px] text-rose-400">{reviewError}</p>}

                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Submit Feedback
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500">No reviews yet for this event.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">{rev.user?.name}</span>
                      <div className="flex gap-0.5 text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-normal">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Box & Venue Meta */}
        <div className="space-y-6">
          {/* Pricing & Booking Glass */}
          <div className="glass rounded-2xl p-6 border border-slate-905 space-y-5 relative">
            {/* Status Pulse */}
            <div className="flex items-center gap-1.5 absolute top-4 right-4">
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                event.status === 'UPCOMING' ? 'bg-emerald-400 shadow-glow-emerald' : 'bg-slate-500'
              }`}></span>
              <span className="text-[9px] font-bold text-slate-400 tracking-wide uppercase">{event.status}</span>
            </div>

            <div className="text-left">
              <p className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">Ticket Price</p>
              <h3 className="text-2xl font-black text-emerald-400 font-display mt-1">
                {event.ticketPrice > 0 ? `₹${event.ticketPrice}` : 'FREE ENTRY'}
              </h3>
            </div>

            {/* Event Time Info */}
            <div className="space-y-3 border-t border-b border-slate-800/60 py-4 text-xs text-slate-300 text-left">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-fuchsia-400" />
                <div>
                  <p className="font-bold text-slate-200">Date & Time</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(event.date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-fuchsia-400" />
                <div>
                  <p className="font-bold text-slate-200">Location Venue</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{event.venue}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-fuchsia-400" />
                <div className="flex-1">
                  <p className="font-bold text-slate-200">Seat Occupancy</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>{availableSeats} remaining</span>
                    <span>{event.maxSeats} total</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${occupancyPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Box */}
            <div className="text-center pt-2">
              {(!user || user.role === 'PARTICIPANT') ? (
                <>
                  {!myRegistration ? (
                    <button
                      onClick={handleJoinRequest}
                      disabled={availableSeats <= 0 || joinLoading || isCompleted}
                      className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      {joinLoading ? 'Sending...' : availableSeats <= 0 ? 'SOLD OUT' : isCompleted ? 'EVENT ENDED' : 'Request to Join'}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {/* PENDING status */}
                      {myRegistration.status === 'PENDING' && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl font-bold flex items-center justify-center gap-1.5">
                          <AlertCircle className="w-4 h-4" /> Pending Organizer Approval
                        </div>
                      )}

                      {/* REJECTED status */}
                      {myRegistration.status === 'REJECTED' && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-bold">
                          Join Request Declined
                        </div>
                      )}

                      {/* ACCEPTED status with OTP SHOWCASE */}
                      {myRegistration.status === 'ACCEPTED' && (
                        <div className="space-y-3.5">
                          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs rounded-xl font-bold">
                            Successfully Registered!
                          </div>
                          
                          {/* Premium OTP Pass Badge */}
                          <div className="p-4 bg-slate-950 border border-fuchsia-500/20 rounded-2xl flex flex-col items-center justify-center space-y-1.5 shadow-lg shadow-fuchsia-500/5">
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Verification Ticket OTP</span>
                            <span className="text-2xl font-black font-display tracking-widest text-fuchsia-400 leading-tight">
                              {myRegistration.otp || '000000'}
                            </span>
                            <span className="text-[8px] text-slate-600">Present this OTP to the organizer at the venue entrance</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 bg-slate-900 border border-slate-800 text-slate-500 text-xs rounded-xl font-semibold">
                  You are viewing as an Organizer
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
