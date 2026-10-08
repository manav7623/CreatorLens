'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/authSlice';
import {
  LayoutDashboard, Megaphone, Users, MessageSquare,
  BarChart3, Settings, LogOut, Shield, Star, Briefcase,
  UserCheck, CreditCard, Upload, Sun, Moon, Menu, X, Sparkles
} from 'lucide-react';

const creatorLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/campaigns', icon: Megaphone, label: 'Find Campaigns' },
  { href: '/dashboard/applications', icon: UserCheck, label: 'My Applications' },
  { href: '/dashboard/content', icon: Upload, label: 'My Submissions' },
  { href: '/dashboard/earnings', icon: CreditCard, label: 'Earnings' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/profile', icon: Settings, label: 'Profile' },
];

const brandLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/campaigns/manage', icon: Megaphone, label: 'My Campaigns' },
  { href: '/campaigns/create', icon: Briefcase, label: 'Create Campaign' },
  { href: '/creators', icon: Users, label: 'Find Creators' },
  { href: '/dashboard/content-review', icon: Upload, label: 'Review Content' },
  { href: '/dashboard/payments', icon: CreditCard, label: 'Payments' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/profile', icon: Settings, label: 'Profile' },
];

const adminLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [theme, setTheme] = useState('dark');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const links = user?.role === 'admin' ? adminLinks :
    user?.role === 'brand' ? brandLinks : creatorLinks;

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const getAvatar = () => {
    if (user?.avatar) return user.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=4F63FF&color=fff&size=80`;
  };

  return (
    <>
      {/* 📱 Mobile Top Navigation Bar */}
      <header className="lg:hidden sticky top-0 z-30 w-full glass bg-dark-900/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/[0.06] active:scale-95 transition-all flex items-center justify-center focus:outline-none"
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-400 flex items-center justify-center shadow-md shadow-primary-500/20">
            <Sparkles size={14} className="text-white" />
          </div>
          <div className="flex items-center font-extrabold text-base tracking-tight">
            <span className="text-white">Creator</span>
            <span className="text-accent-400">Lens</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <img
            src={getAvatar()}
            alt={user?.name}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-primary-500/30"
          />
        </div>
      </header>

      {/* 📱 Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* 🖥️/📱 Responsive Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 glass bg-dark-900/98 lg:bg-dark-900/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Header (Cleanly aligned, no dividing line) */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-400 flex items-center justify-center shadow-md shadow-primary-500/25 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles size={16} className="text-white fill-white/20" />
            </div>
            <div className="flex items-center font-extrabold text-lg tracking-tight">
              <span className="text-white">Creator</span>
              <span className="text-accent-400">Lens</span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Close Navigation Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card Pill (Clean floating pill, no dividing lines) */}
        <div className="mx-3.5 mb-2 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] transition-all flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img
              src={getAvatar()}
              alt={user?.name}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-dark-900" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-xs text-white truncate">{user?.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                user?.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                user?.role === 'brand' ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {user?.role}
              </span>
              {user?.isVerified && (
                <Shield size={11} className="text-green-400" title="Verified" />
              )}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
          {links.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/15 text-primary-400 font-semibold shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span className="text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Theme & Logout (Clean, no top dividing line) */}
        <div className="p-3 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all w-full text-left"
          >
            {theme === 'dark' ? <Sun size={17} style={{ flexShrink: 0 }} /> : <Moon size={17} style={{ flexShrink: 0 }} />}
            <span className="text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full text-left"
          >
            <LogOut size={17} style={{ flexShrink: 0 }} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

