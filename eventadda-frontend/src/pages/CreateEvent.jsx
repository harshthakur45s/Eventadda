import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Calendar, MapPin, Tag, Users, Landmark, Plus, ArrowLeft } from 'lucide-react';

const CATEGORIES = ['Tech', 'Music', 'Sports', 'Seminar'];

const PRESET_BANNERS = {
  Tech: [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800'
  ],
  Music: [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'
  ],
  Sports: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    'https://images.unsplash.com/photo-1484480974693-2ca0a72f3841?w=800',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
    'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800',
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800'
  ],
  Seminar: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
    'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800'
  ]
};

const CreateEvent = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Tech');
  const [maxSeats, setMaxSeats] = useState(100);
  const [isPaid, setIsPaid] = useState(false);
  const [ticketPrice, setTicketPrice] = useState(0.0);
  const [bannerImage, setBannerImage] = useState(PRESET_BANNERS.Tech[0]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setCategory(cat);
    if (PRESET_BANNERS[cat]) {
      setBannerImage(PRESET_BANNERS[cat][0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const price = isPaid ? parseFloat(ticketPrice) : 0.0;
      await api.events.create({
        title,
        description,
        venue,
        date,
        category,
        maxSeats: parseInt(maxSeats, 10),
        ticketPrice: price,
        bannerImage
      });
      navigate('/organizer/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create event. Verify details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8 select-none text-left">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/organizer/dashboard')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel & Go Dashboard
      </button>

      <div className="glass border border-slate-900 rounded-3xl p-8 shadow-2xl relative">
        <div className="absolute top-0 right-1/4 w-48 h-48 rounded-full bg-indigo-600/5 blur-[80px] pointer-events-none"></div>

        {/* Header */}
        <div className="pb-6 border-b border-slate-800 mb-6">
          <h1 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
            <Plus className="w-6 h-6 text-indigo-400" /> Host a New Event
          </h1>
          <p className="text-xs text-slate-500 mt-1">Publish an elite event to open bookings and coordinate registrations</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 mb-6 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI & Web3 Seminar 2026"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 placeholder-slate-700"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Event Description</label>
            <textarea
              required
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the event covers, key highlights, schedule..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 placeholder-slate-700"
            ></textarea>
          </div>

          {/* Grid: Venue & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Venue Location</label>
              <div className="relative flex items-center bg-slate-950 border border-slate-800 focus-within:border-indigo-500/50 rounded-xl">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-4" />
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Tech Arena Hall 4"
                  className="w-full pl-11 pr-4 py-3 bg-transparent border-0 text-sm text-slate-200 focus:outline-none focus:ring-0 placeholder-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Date & Time</label>
              <div className="relative flex items-center bg-slate-950 border border-slate-800 focus-within:border-indigo-500/50 rounded-xl">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-4" />
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-transparent border-0 text-sm text-slate-200 focus:outline-none focus:ring-0 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Grid: Category & Seats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Category Tag</label>
              <div className="relative flex items-center bg-slate-950 border border-slate-800 focus-within:border-indigo-500/50 rounded-xl">
                <Tag className="w-4 h-4 text-slate-500 absolute left-4" />
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  className="w-full pl-11 pr-4 py-3 bg-transparent border-0 text-sm text-slate-300 focus:outline-none focus:ring-0"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-950 text-slate-300">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Maximum Capacity (Seats)</label>
              <div className="relative flex items-center bg-slate-950 border border-slate-800 focus-within:border-indigo-500/50 rounded-xl">
                <Users className="w-4 h-4 text-slate-500 absolute left-4" />
                <input
                  type="number"
                  required
                  min="5"
                  value={maxSeats}
                  onChange={(e) => setMaxSeats(e.target.value)}
                  placeholder="100"
                  className="w-full pl-11 pr-4 py-3 bg-transparent border-0 text-sm text-slate-200 focus:outline-none focus:ring-0 placeholder-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Free vs Paid Trigger */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-300">Ticket Type</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Toggle if entry is free or requires payment</p>
              </div>
              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsPaid(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    !isPaid ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow' : 'text-slate-500'
                  }`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaid(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isPaid ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow' : 'text-slate-500'
                  }`}
                >
                  Paid
                </button>
              </div>
            </div>

            {isPaid && (
              <div className="space-y-1.5 pt-2 border-t border-slate-900">
                <label className="text-xs font-semibold text-slate-400">Ticket Price (INR)</label>
                <div className="relative flex items-center bg-slate-900 border border-slate-800 focus-within:border-indigo-500/50 rounded-xl">
                  <Landmark className="w-4 h-4 text-slate-500 absolute left-4" />
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required={isPaid}
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    placeholder="499.00"
                    className="w-full pl-11 pr-4 py-3 bg-transparent border-0 text-sm text-slate-200 focus:outline-none focus:ring-0 placeholder-slate-700"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Preset Banner Selector Gallery */}
          <div className="space-y-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-300">Event Cover Banner</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Select a high-resolution preset or paste your own custom URL</p>
            </div>
            
            {/* Selected Preview */}
            {bannerImage && (
              <div className="h-32 w-full rounded-xl overflow-hidden border border-slate-800/80 relative">
                <img src={bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>
                <span className="absolute bottom-2 left-3 text-[9px] uppercase tracking-widest text-indigo-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-indigo-500/20">
                  Selected Cover
                </span>
              </div>
            )}

            {/* Clickable Preset Icons */}
            <div className="space-y-1">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Select a category preset</p>
              <div className="flex gap-3 overflow-x-auto pb-1.5">
                {PRESET_BANNERS[category]?.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBannerImage(url)}
                    className={`h-12 w-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      bannerImage === url ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1 pt-1 border-t border-slate-900">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Or Paste Custom Image URL</p>
              <input
                type="text"
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Action Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            {loading ? 'Publishing Event...' : 'Publish Live Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
