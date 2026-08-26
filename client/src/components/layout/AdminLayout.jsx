import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
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
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ unreadInquiries: 0, pendingBookings: 0 });

  useEffect(() => {
    const fetchBadgeCounts = async () => {
      try {
        const res = await api.get('/admin/dashboard/stats');
        if (res.success && res.data?.counts) {
          setStats({
            unreadInquiries: res.data.counts.unreadInquiries || 0,
            pendingBookings: res.data.counts.pendingBookings || 0,
          });
        }
      } catch (err) {
        // silent fail
      }
    };
    fetchBadgeCounts();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Projects / Portfolio', path: '/admin/projects', icon: FolderKanban },
    { name: 'Services', path: '/admin/services', icon: Layers },
    { name: 'Pricing Packages', path: '/admin/packages', icon: DollarSign },
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
      badgeColor: 'bg-amber-500 text-black',
    },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
    { name: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
    { name: 'Client Brands', path: '/admin/brands', icon: Building2 },
    { name: 'Media Library', path: '/admin/media', icon: ImageIcon },
    { name: 'AI Assistant Training', path: '/admin/assistant', icon: Bot },
    { name: 'Project Estimator CMS', path: '/admin/estimator', icon: Calculator },
    { name: 'Client Invoices', path: '/admin/invoices', icon: FileText },
    { name: 'Site Settings', path: '/admin/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0c0c0e] border-r border-zinc-800/80">
      {/* Header / Brand */}
      <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-display font-bold text-white text-sm">
            S
          </div>
          <div>
            <span className="font-bold text-white text-sm block">Sakhawat Admin</span>
            <span className="text-[10px] text-zinc-400 font-mono">CMS Panel v1.0</span>
          </div>
        </Link>
        <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <ShieldCheck className="w-4 h-4" />
        </span>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-3 py-2">
          Management
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* User Profile & Logout Bottom */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-zinc-400 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/50 hover:text-rose-400 text-zinc-400 border border-transparent hover:border-rose-500/30 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed top-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 h-full z-10">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs text-zinc-400 hidden sm:inline">
              Control Panel & Content Management
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-850 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Website</span>
            </Link>
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
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
