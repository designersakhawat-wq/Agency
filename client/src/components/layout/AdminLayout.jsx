import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  DollarSign,
  Inbox,
  Calendar,
  MessageSquareQuote,
  HelpCircle,
  Building2,
  Image as ImageIcon,
  Bot,
  Calculator,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  User,
  Sparkles,
  RefreshCw,
  Zap,
  Globe,
  Palette,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({ unreadInquiries: 0, pendingBookings: 0 });

  useEffect(() => {
    fetchBadgeCounts();
  }, [location.pathname]);

  const fetchBadgeCounts = async () => {
    try {
      const res = await api.get('/admin/dashboard/stats').catch(() => null);
      if (res && res.success && res.data?.counts) {
        setStats({
          unreadInquiries: res.data.counts.unreadInquiries || 0,
          pendingBookings: res.data.counts.pendingBookings || 0,
        });
      }
    } catch (err) {}
  };

  const handleQuickSync = async () => {
    try {
      setIsSyncing(true);
      localStorage.removeItem('sakhawat_cached_settings');
      localStorage.removeItem('sakhawat_cached_brand');
      await api.get('/settings').catch(() => null);
      addToast('Frontend & Backend synchronized! Cache refreshed.', 'success');
    } catch (e) {
      addToast('Sync completed.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navSections = [
    {
      label: 'Main & Visual Identity',
      items: [
        { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Site Identity & SEO', path: '/admin/site-identity', icon: ShieldCheck },
        { name: 'Homepage CMS', path: '/admin/homepage', icon: Layers },
        { name: 'About Page CMS', path: '/admin/about', icon: User },
      ],
    },
    {
      label: 'Creative Work & Offerings',
      items: [
        { name: 'Services CMS', path: '/admin/services', icon: Palette },
        { name: 'Pricing Packages', path: '/admin/packages', icon: DollarSign },
        { name: 'Portfolio Projects', path: '/admin/projects', icon: FolderKanban },
      ],
    },
    {
      label: 'Client Management & Leads',
      items: [
        {
          name: 'Inquiries Inbox',
          path: '/admin/inquiries',
          icon: Inbox,
          badge: stats.unreadInquiries > 0 ? stats.unreadInquiries : null,
          badgeColor: 'bg-rose-500 text-white',
        },
        {
          name: 'Bookings Scheduler',
          path: '/admin/bookings',
          icon: Calendar,
          badge: stats.pendingBookings > 0 ? stats.pendingBookings : null,
          badgeColor: 'bg-amber-400 text-black font-black',
        },
        { name: 'Client Invoices', path: '/admin/invoices', icon: FileText },
      ],
    },
    {
      label: 'Social Proof & Media',
      items: [
        { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
        { name: 'FAQs Accordion', path: '/admin/faqs', icon: HelpCircle },
        { name: 'Client Brands', path: '/admin/brands', icon: Building2 },
        { name: 'Media Library', path: '/admin/media', icon: ImageIcon },
      ],
    },
    {
      label: 'AI & System Tools',
      items: [
        { name: 'AI Assistant Training', path: '/admin/assistant', icon: Bot },
        { name: 'Project Estimator CMS', path: '/admin/estimator', icon: Calculator },
        { name: 'Global Site Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#08080a] border-r border-zinc-800/90 select-none">
      {/* Header / Brand */}
      <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
        <Link to="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 p-[1.5px] shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center font-display font-black text-sm text-teal-300">
              SH
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm text-white block tracking-tight">
                Sakhawat Studio
              </span>
            </div>
            <span className="text-[10px] text-teal-400 font-mono font-semibold block">
              Admin CMS v2.0
            </span>
          </div>
        </Link>
        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live</span>
        </span>
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-5 custom-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 px-3 py-1">
              {section.label}
            </div>

            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-950/40'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* User Profile & Quick Actions Bottom */}
      <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-950/80 space-y-2.5">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-xs">
            {user?.name?.[0] || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Md Sakhawat Hossain'}</p>
            <p className="text-[10px] text-zinc-400 truncate">{user?.email || 'admin@designersakhawat.com'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>View Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/40 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed top-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 h-full z-10">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Sticky Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#070709]/85 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-8 flex items-center justify-between shadow-lg shadow-black/40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full hidden sm:inline">
                CMS CONTROL PANEL
              </span>
              <span className="text-xs text-zinc-400 hidden md:inline">
                Real-Time Synchronized Database
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Resync Button */}
            <button
              onClick={handleQuickSync}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-1.5 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
              title="Resync cached settings with live frontend"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Resync Frontend</span>
            </button>

            {/* Visit Live Website CTA */}
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-950 bg-gradient-to-r from-teal-400 to-cyan-400 px-3.5 py-1.5 rounded-xl shadow-md shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-105 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Site 🚀</span>
            </Link>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
