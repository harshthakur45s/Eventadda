import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Calendar, MapPin, AlertCircle, CheckCircle2, XCircle, Info, Trash2, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const ParticipantDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      const data = await api.registrations.getParticipantRegistrations();
      setRegistrations(data);
    } catch (e) {
      console.error("Failed to load joined events", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (regId) => {
    if (window.confirm("Are you sure you want to cancel your registration request?")) {
      try {
        await api.registrations.cancelBooking(regId);
        fetchRegistrations();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-500">Loading your schedule...</div>;
  }

  // Filter cancelled registrations out of main listing
  const activeRegistrations = registrations.filter(r => r.status !== 'CANCELLED');

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 select-none text-left">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold font-display text-slate-100">My Schedule</h1>
        <p className="text-xs text-slate-400 mt-1">Check pending join requests, view approved OTP tickets, and review completed events</p>
      </div>

      {/* Grid List */}
      {activeRegistrations.length === 0 ? (
        <div className="py-24 text-center glass rounded-2xl border border-slate-900 space-y-4">
          <p className="text-slate-500 text-sm">You haven't requested to join any events yet.</p>
          <Link 
            to="/"
            className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white rounded-xl text-xs font-semibold inline-block shadow-lg shadow-fuchsia-500/10"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {activeRegistrations.map((reg) => {
            const isCompleted = new Date(reg.event.date) < new Date();
            return (
              <div 
                key={reg.id}
                className="glass rounded-3xl p-6 border border-slate-900 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative hover:border-fuchsia-500/15 transition-all duration-300"
              >
                {/* Event Core Details */}
                <div className="space-y-3.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold tracking-wider uppercase bg-slate-950/80 text-fuchsia-400 border border-fuchsia-500/10">
                      {reg.event.category}
                    </span>
                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[9px] font-bold text-slate-500 uppercase">
                        Past Event
                      </span>
                    )}
                  </div>
                  
                  <Link 
                    to={`/events/${reg.event.id}`}
                    className="text-xl font-bold font-display text-slate-100 hover:text-fuchsia-400 transition-colors line-clamp-1"
                  >
                    {reg.event.title}
                  </Link>

                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(reg.event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="line-clamp-1">{reg.event.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Status Indicators & Action Section */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
                  {/* Status Badges */}
                  <div className="flex items-center justify-center">
                    {reg.status === 'PENDING' && (
                      <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Pending Approval
                      </div>
                    )}

                    {reg.status === 'REJECTED' && (
                      <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Request Declined
                      </div>
                    )}

                    {reg.status === 'ACCEPTED' && (
                      <div className="flex flex-col items-center sm:items-end gap-1.5">
                        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-glow-emerald">
                          <CheckCircle2 className="w-4 h-4" /> Joined
                        </div>
                        {/* OTP passcode display */}
                        <div className="px-3.5 py-1 bg-slate-950 border border-fuchsia-500/15 rounded-lg text-center shadow-glow-fuchsia">
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest">OTP PASS</p>
                          <p className="text-sm font-black font-display tracking-widest text-fuchsia-400 leading-tight">{reg.otp}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions (Cancel Booking / Leave Review) */}
                  <div className="flex items-center justify-center gap-2">
                    {/* Write Review Link */}
                    {reg.status === 'ACCEPTED' && isCompleted && (
                      <Link
                        to={`/events/${reg.event.id}`}
                        className="px-3 py-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow text-center shadow-fuchsia-600/10"
                      >
                        Write Review
                      </Link>
                    )}

                    {/* Cancellation Trigger */}
                    {reg.status !== 'REJECTED' && !isCompleted && (
                      <button
                        onClick={() => handleCancel(reg.id)}
                        className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                        title="Cancel Registration"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sm:hidden lg:inline">Cancel Request</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParticipantDashboard;
