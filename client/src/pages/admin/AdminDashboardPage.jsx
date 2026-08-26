import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  FolderKanban,
  Inbox,
  Calendar,
  Layers,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Image as ImageIcon,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import Button from '../../components/common/Button';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/dashboard/stats');
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <Loader message="Aggregating metrics and activity..." fullScreen />;
  }

  const counts = stats?.counts || {};

  const statCards = [
    {
      label: 'Portfolio Projects',
      value: counts.projects || 0,
      sub: `${counts.featuredProjects || 0} Featured on Homepage`,
      icon: FolderKanban,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      link: '/admin/projects',
    },
    {
      label: 'Inquiries Received',
      value: counts.inquiries || 0,
      sub: `${counts.unreadInquiries || 0} Unread Inquiries`,
      icon: Inbox,
      color: counts.unreadInquiries > 0 ? 'text-rose-400' : 'text-emerald-400',
      bg: counts.unreadInquiries > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20',
      link: '/admin/inquiries',
    },
    {
      label: 'Discovery Bookings',
      value: counts.bookings || 0,
      sub: `${counts.pendingBookings || 0} Pending Confirmation`,
      icon: Calendar,
      color: counts.pendingBookings > 0 ? 'text-amber-400' : 'text-indigo-400',
      bg: counts.pendingBookings > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-indigo-500/10 border-indigo-500/20',
      link: '/admin/bookings',
    },
    {
      label: 'Active Services',
      value: counts.services || 0,
      sub: `${counts.testimonials || 0} Client Testimonials`,
      icon: Layers,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      link: '/admin/services',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl glass-card border border-zinc-800 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-950">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
              System Online & Operational
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Welcome back, Sakhawat!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Here's a quick pulse of your portfolio inquiries, scheduled client calls, and published works.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/admin/projects?create=true')}
            className="cursor-pointer font-bold shadow-md"
          >
            + New Project
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={ImageIcon}
            onClick={() => navigate('/admin/media')}
            className="cursor-pointer"
          >
            Upload Media
          </Button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <Link
            key={idx}
            to={card.link}
            className="p-6 rounded-2xl glass-card border border-zinc-800/80 hover:border-indigo-500/40 transition-colors group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl border ${card.bg} ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
            </div>

            <div>
              <span className="text-3xl font-black font-display text-white group-hover:text-indigo-300 transition-colors">
                {card.value}
              </span>
              <h4 className="text-xs font-bold text-zinc-300 mt-1">{card.label}</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Inquiries & Recent Bookings Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Inquiries */}
        <div className="glass-card rounded-2xl border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Recent Inquiries</h3>
            </div>
            <Link to="/admin/inquiries" className="text-xs text-indigo-400 hover:underline">
              View All →
            </Link>
          </div>

          {stats?.recentInquiries?.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">No contact inquiries yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate">{inq.name}</span>
                      <Badge
                        variant={inq.status === 'UNREAD' ? 'rose' : 'default'}
                        size="sm"
                      >
                        {inq.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">{inq.email}</p>
                    <p className="text-xs text-zinc-300 mt-1 line-clamp-1">{inq.message}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="glass-card rounded-2xl border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Upcoming Discovery Calls</h3>
            </div>
            <Link to="/admin/bookings" className="text-xs text-indigo-400 hover:underline">
              Manage Schedule →
            </Link>
          </div>

          {stats?.recentBookings?.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">No scheduled meetings yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate">{b.name}</span>
                      <Badge
                        variant={b.status === 'PENDING' ? 'amber' : 'emerald'}
                        size="sm"
                      >
                        {b.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                      📅 {b.date} at {b.timeSlot}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{b.serviceName || 'Consultation'}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
