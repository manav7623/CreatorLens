'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '@/lib/api';
import {
  BarChart3, TrendingUp, Star, Briefcase, Users,
  CheckCircle, DollarSign, Eye, Zap, Sparkles, ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

function StatCard({ icon: Icon, label, value, sub, color = 'text-primary-400', bg = 'bg-primary-500/15' }) {
  return (
    <div className="glass rounded-2xl p-5 sm:p-6 card-hover relative overflow-hidden transition-all duration-300">
      <div className="flex items-start justify-between mb-3.5">
        <div className={`w-11 h-11 rounded-xl ${bg} ${color} flex items-center justify-center shadow-sm`}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400 tracking-wider">
          LIVE
        </span>
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 text-white">{value}</div>
      <div className="text-gray-400 text-xs sm:text-sm font-medium">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function AIScoreWidget({ score, profile }) {
  const getRating = (s) => {
    if (s >= 85) return { label: 'Top 5% Creator', color: 'text-emerald-400', stroke: '#10B981', badge: 'bg-emerald-500/15 text-emerald-400' };
    if (s >= 70) return { label: 'High Authenticity', color: 'text-primary-400', stroke: '#6366F1', badge: 'bg-primary-500/15 text-primary-400' };
    if (s >= 50) return { label: 'Good Potential', color: 'text-amber-400', stroke: '#F59E0B', badge: 'bg-amber-500/15 text-amber-400' };
    return { label: 'Needs Profile Setup', color: 'text-rose-400', stroke: '#F43F5E', badge: 'bg-rose-500/15 text-rose-400' };
  };
  const rating = getRating(score);

  return (
    <div className="glass rounded-2xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-500/15 text-primary-400 flex items-center justify-center">
            <Zap size={16} />
          </div>
          <span className="font-bold text-sm text-white">AI Creator Score</span>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${rating.badge}`}>
          {rating.label}
        </span>
      </div>

      <div className="relative w-32 h-32 mx-auto flex items-center justify-center my-2">
        <div className="w-full h-full rounded-full flex flex-col items-center justify-center">
          <div className={`text-4xl font-extrabold tracking-tight ${rating.color}`}>{score || 0}</div>
          <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Score</span>
        </div>
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="9" />
          <circle
            cx="64" cy="64" r="54" fill="none"
            stroke={rating.stroke}
            strokeWidth="9"
            strokeDasharray={`${((score || 0) / 100) * 339} 339`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${rating.stroke}66)` }}
          />
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="p-2.5 rounded-xl bg-white/[0.03] text-center">
          <div className="text-[11px] text-gray-400">Engagement</div>
          <div className="text-sm font-bold text-white mt-0.5">
            {profile?.engagementRate ? `${profile.engagementRate}%` : '5.4%'}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.03] text-center">
          <div className="text-[11px] text-gray-400">Audience Real</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">
            {profile?.fakeFollowerPercentage !== undefined ? `${100 - profile.fakeFollowerPercentage}%` : '96%'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint = user?.role === 'brand' ? '/analytics/brand' : '/analytics/creator';
        const { data } = await api.get(endpoint);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isCreator = user?.role === 'creator';
  const profile = isCreator ? user?.creatorProfile : user?.brandProfile;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = isCreator
    ? stats?.monthlyData?.map(d => {
        const m = d?._id?.month || 1;
        const y = d?._id?.year ? String(d._id.year).slice(-2) : '26';
        return {
          name: `${monthNames[m - 1] || 'Month'} '${y}`,
          Applications: d?.count || 0
        };
      })
    : stats?.recentCampaigns?.map(c => ({
        name: c?.title && typeof c.title === 'string' ? (c.title.length > 15 ? c.title.slice(0, 15) + '...' : c.title) : 'Campaign',
        Views: c?.views || 0
      }));
  const hasChartData = isCreator
    ? (Array.isArray(stats?.monthlyData) && stats.monthlyData.length > 0)
    : (Array.isArray(stats?.recentCampaigns) && stats.recentCampaigns.length > 0);

  const firstName = user?.name && typeof user.name === 'string' ? user.name.trim().split(' ')[0] : (isCreator ? 'Creator' : 'Brand');

  return (
    <div className="space-y-8">
      {/* Header (Clean, sleek, no underline dividers) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary-500/15 text-primary-400">
              {isCreator ? 'CREATOR HUB' : 'BRAND PORTAL'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, <span className="gradient-text">{firstName}</span> 👋
          </h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            {isCreator ? 'Track your collaborations, performance & brand deals' : 'Manage your campaigns and find the perfect creators'}
          </p>
        </div>
        <Link
          href={isCreator ? '/campaigns' : '/campaigns/create'}
          className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap self-stretch sm:self-auto px-5 py-3 text-sm font-semibold rounded-xl text-center shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {isCreator ? (
            <>
              <span>Find Campaigns</span>
              <ArrowRight size={16} />
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Create Campaign</span>
            </>
          )}
        </Link>
      </div>

      {/* Stats Grid (Clean 4 cards, no underline dividing lines) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isCreator ? (
          <>
            <StatCard icon={Briefcase} label="Total Applications" value={stats?.stats?.totalApplications || 0} color="text-blue-400" bg="bg-blue-500/15" />
            <StatCard icon={CheckCircle} label="Accepted" value={stats?.stats?.acceptedApplications || 0} color="text-emerald-400" bg="bg-emerald-500/15" />
            <StatCard icon={Star} label="Completed" value={stats?.stats?.completedCollabs || 0} color="text-amber-400" bg="bg-amber-500/15" />
            <StatCard icon={DollarSign} label="Total Earnings" value={`₹${(stats?.stats?.totalEarnings || 0).toLocaleString()}`} color="text-purple-400" bg="bg-purple-500/15" />
          </>
        ) : (
          <>
            <StatCard icon={Megaphone} label="Total Campaigns" value={stats?.stats?.totalCampaigns || 0} color="text-blue-400" bg="bg-blue-500/15" />
            <StatCard icon={TrendingUp} label="Active Campaigns" value={stats?.stats?.activeCampaigns || 0} color="text-emerald-400" bg="bg-emerald-500/15" />
            <StatCard icon={Users} label="Applications" value={stats?.stats?.totalApplications || 0} color="text-amber-400" bg="bg-amber-500/15" />
            <StatCard icon={DollarSign} label="Total Spend" value={`₹${(stats?.stats?.totalSpend || 0).toLocaleString()}`} color="text-purple-400" bg="bg-purple-500/15" />
          </>
        )}
      </div>

      {/* Main Content (Chart + AI Score) */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-primary-400" />
              <span>{isCreator ? 'Application Trend' : 'Campaign Views (Performance)'}</span>
            </h3>
            <span className="text-xs text-gray-500 font-mono">Monthly Overview</span>
          </div>
          {hasChartData && isMounted ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#4338CA" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                  contentStyle={{ background: '#13131F', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#fff', fontWeight: 600 }}
                />
                <Bar dataKey={isCreator ? "Applications" : "Views"} fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-sm">
              <BarChart3 size={32} className="text-gray-600 mb-2" />
              <span>{isCreator ? 'No application data yet. Apply to your first campaign!' : 'No campaigns created yet.'}</span>
            </div>
          )}
        </div>

        {/* AI Score (Creator) / Quick Actions (Brand) */}
        {isCreator ? (
          <AIScoreWidget
            score={user?.creatorProfile?.aiScore || 0}
            profile={user?.creatorProfile}
          />
        ) : (
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold text-base text-white mb-4">Quick Actions</h3>
            <div className="space-y-2.5">
              <Link
                href="/campaigns/create"
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all text-xs font-semibold text-white group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center">
                    <Briefcase size={14} />
                  </div>
                  <span>Create Campaign</span>
                </div>
                <span className="text-gray-400 group-hover:text-primary-400">→</span>
              </Link>

              <Link
                href="/creators"
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all text-xs font-semibold text-white group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Users size={14} />
                  </div>
                  <span>Find Creators</span>
                </div>
                <span className="text-gray-400 group-hover:text-primary-400">→</span>
              </Link>

              <Link
                href="/dashboard/content-review"
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all text-xs font-semibold text-white group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle size={14} />
                  </div>
                  <span>Review Submissions</span>
                </div>
                <span className="text-gray-400 group-hover:text-primary-400">→</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Profile Setup Banner (Clean, no harsh underline) */}
      {isCreator && (!profile?.socialLinks?.instagram?.username && !profile?.socialLinks?.youtube?.username) && (
        <div className="glass rounded-2xl p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Zap size={20} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-white mb-1">Complete Your Creator Profile</h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-3.5">
                Connect your social accounts to calculate your verified authenticity score and get discovered by top brands.
              </p>
              <Link href="/dashboard/profile" className="btn-accent text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 font-bold shadow-md">
                <span>Setup Profile</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

