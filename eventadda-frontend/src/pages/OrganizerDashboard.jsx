import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Layers, Users, Percent, CheckCircle, XCircle, Clock, Trash2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const stats = await api.analytics.getOrganizer();
      setAnalytics(stats);

      const pending = await api.registrations.getOrganizerRequests();
      setRequests(pending);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAccept = async (reqId) => {
    try {
      await api.registrations.acceptRequest(reqId);
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (reqId) => {
    try {
      await api.registrations.rejectRequest(reqId);
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event? This will erase all registrations and reviews.")) {
      try {
        await api.events.delete(eventId);
        fetchDashboardData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-500">Loading Organizer Workspace...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 select-none text-left">
      {/* Welcome Title */}
      <div>
        <h1 className="text-3xl font-extrabold font-display text-slate-100">Organizer Workspace</h1>
        <p className="text-xs text-slate-400 mt-1">Review event performances, coordinate attendee list approvals, and manage schedules</p>
      </div>

      {/* Analytics Grid */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Events (Fuchsia) */}
          <div className="glass rounded-2xl p-5 border border-slate-900 flex items-center gap-4 hover:shadow-glow-fuchsia transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 shadow-glow-fuchsia">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Events</p>
              <h3 className="text-xl font-bold font-display text-slate-100 mt-0.5">{analytics.totalEvents}</h3>
            </div>
          </div>

          {/* Card 2: Total Registrations (Violet) */}
          <div className="glass rounded-2xl p-5 border border-slate-900 flex items-center gap-4 hover:shadow-glow-violet transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-glow-violet">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Requests</p>
              <h3 className="text-xl font-bold font-display text-slate-100 mt-0.5">{analytics.totalRegistrations}</h3>
            </div>
          </div>

          {/* Card 3: Accepted Count (Emerald) */}
          <div className="glass rounded-2xl p-5 border border-slate-900 flex items-center gap-4 hover:shadow-glow-emerald transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-glow-emerald">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Attendees Joined</p>
              <h3 className="text-xl font-bold font-display text-slate-100 mt-0.5">{analytics.acceptedCount}</h3>
            </div>
          </div>

          {/* Card 4: Occupancy Rate (Amber) */}
          <div className="glass rounded-2xl p-5 border border-slate-900 flex items-center gap-4 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Avg. Occupancy</p>
              <h3 className="text-xl font-bold font-display text-slate-100 mt-0.5">{analytics.occupancyRate}%</h3>
            </div>
          </div>
        </div>
      )}

      {/* Main Core Columns: Pending Requests vs Event List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Pending Approvals Manager */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 shadow-glow-fuchsia animate-pulse">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold font-display text-slate-200">Pending Approvals Manager</h2>
          </div>

          {requests.filter(r => r.status === 'PENDING').length === 0 ? (
            <div className="py-20 text-center glass rounded-2xl border border-slate-900">
              <p className="text-slate-500 text-xs">No pending join requests to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.filter(r => r.status === 'PENDING').map((req) => (
                <div 
                  key={req.id} 
                  className="glass rounded-2xl p-5 border border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <p className="text-xs text-fuchsia-400 font-bold font-display uppercase tracking-wider">
                      {req.event.title}
                    </p>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{req.user.name}</h4>
                      <p className="text-[11px] text-slate-500">{req.user.email}</p>
                    </div>
                    <p className="text-[10px] text-slate-600">
                      Requested: {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Accept / Decline Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-fuchsia-600/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-rose-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: List of Created Events */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 shadow-glow-fuchsia">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold font-display text-slate-200">My Created Events</h2>
          </div>

          {analytics?.eventsList.length === 0 ? (
            <div className="py-20 text-center glass rounded-2xl border border-slate-900">
              <p className="text-slate-500 text-xs">No events hosted yet.</p>
              <Link 
                to="/organizer/create-event"
                className="mt-4 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white rounded-lg text-xs font-bold inline-block"
              >
                Host an Event
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics?.eventsList.map((evt) => (
                <div 
                  key={evt.eventId} 
                  className="glass rounded-2xl p-5 border border-slate-900 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/events/${evt.eventId}`} className="text-sm font-bold text-slate-200 hover:text-fuchsia-400 transition-colors">
                        {evt.title}
                      </Link>
                      <span className="block text-[10px] text-fuchsia-400 font-semibold tracking-wider uppercase mt-1">
                        {evt.category}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteEvent(evt.eventId)}
                      className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Performance Indicators */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                      <p className="text-[10px] text-slate-500">Attendees Joined</p>
                      <p className="text-lg font-bold text-slate-200 mt-1 font-display">{evt.joinedCount}</p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                      <p className="text-[10px] text-slate-500">Seats Remaining</p>
                      <p className="text-lg font-bold text-emerald-400 mt-1 font-display">{evt.availableSeats}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
