'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  CheckCircle, Clock, XCircle, Star, DollarSign, MessageSquare, 
  ArrowUpRight, Upload, Calendar, Building
} from 'lucide-react';

const statusConfig = {
  pending:     { label: 'Pending Review', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
  shortlisted: { label: 'Shortlisted',    icon: Star,  color: 'text-blue-400',   bg: 'bg-blue-500/20',   border: 'border-blue-500/30' },
  accepted:    { label: 'Deal Accepted',  icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
  rejected:    { label: 'Rejected',       icon: XCircle, color: 'text-red-400',    bg: 'bg-red-500/20',    border: 'border-red-500/30' },
  completed:   { label: 'Completed',      icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/applications/my');
        setApplications(data.applications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = filter === 'all' 
    ? applications 
    : applications.filter(a => a.status === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-white">My Campaign Applications</h1>
        <p className="text-gray-400 text-xs sm:text-sm">Track your proposals, chat with brands and submit deliverables</p>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'shortlisted', 'accepted', 'completed', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl capitalize transition-all font-medium ${
              filter === s 
                ? 'bg-primary-500 text-white shadow-md' 
                : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600'
            }`}
          >
            {s === 'all' ? 'All Applications' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-gray-400 border border-dark-600">
          <Clock size={40} className="mx-auto mb-3 opacity-25 text-primary-400" />
          <p className="font-semibold text-gray-300">No applications found</p>
          <p className="text-xs text-gray-500 mt-1">Explore active campaigns and apply to start collaborating with top brands!</p>
          <Link href="/campaigns" className="btn-primary inline-flex items-center gap-2 mt-4 text-xs sm:text-sm px-4 py-2.5 rounded-xl">
            Browse Campaigns →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(app => {
            const appId = app._id || app.id;
            const config = statusConfig[app.status] || statusConfig.pending;
            const Icon = config.icon;
            const brandName = app.brand?.brandProfile?.companyName || app.brand?.name || 'Brand Partner';

            return (
              <div key={appId} className="glass rounded-2xl p-4 sm:p-6 border border-dark-600 hover:border-dark-500 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  {/* Campaign Title & Brand */}
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <h3 className="font-bold text-base sm:text-lg text-white">{app.campaign?.title || 'Campaign Deal'}</h3>
                      <span className={`flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full font-medium ${config.bg} ${config.color} ${config.border} border`}>
                        <Icon size={12} /> {config.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(brandName)}&background=22223A&color=4F63FF&size=32`}
                        className="w-5 h-5 rounded-md object-cover"
                      />
                      <span>Brand: <strong className="text-gray-200">{brandName}</strong></span>
                      <span>•</span>
                      <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Rates / Deal Amount */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 pt-2 sm:pt-0 border-t border-dark-600 sm:border-0">
                    <div className="text-xs text-gray-400">Proposed Rate</div>
                    <div className="font-extrabold text-base sm:text-lg text-green-400">
                      ₹{app.dealAmount?.toLocaleString() || app.proposedRate?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Proposal Text */}
                {app.proposal && (
                  <div className="bg-dark-750/70 rounded-xl p-3 text-xs sm:text-sm text-gray-300 leading-relaxed mb-4 border border-dark-600/50">
                    <span className="text-gray-400 font-semibold block text-[11px] mb-0.5">Your Proposal:</span>
                    <p className="line-clamp-3">{app.proposal}</p>
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-dark-600">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {app.timeline && (
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-gray-500" /> {app.timeline}
                      </span>
                    )}
                    {app.deliverables?.length > 0 && (
                      <span className="text-primary-300 bg-primary-500/10 px-2 py-0.5 rounded-md text-[11px]">
                        📦 {app.deliverables[0]}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* 💬 Direct Message Brand button */}
                    <Link
                      href={`/messages?app=${appId}`}
                      className="btn-secondary text-xs py-2 px-3.5 rounded-xl flex-1 sm:flex-none flex items-center justify-center gap-1.5 border border-dark-500 hover:border-primary-500 transition-all text-gray-200 hover:text-white"
                    >
                      <MessageSquare size={14} className="text-primary-400" /> Message Brand
                    </Link>

                    {/* Submit Deliverable button if accepted */}
                    {app.status === 'accepted' && (
                      <Link
                        href="/dashboard/content"
                        className="btn-primary text-xs py-2 px-3.5 rounded-xl flex-1 sm:flex-none flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                      >
                        <Upload size={14} /> Submit Work
                      </Link>
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
}

