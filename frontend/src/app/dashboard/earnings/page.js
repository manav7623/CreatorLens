'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { 
  DollarSign, Clock, CheckCircle, Lock, TrendingUp, Wallet, 
  ArrowUpRight, ShieldCheck, HelpCircle, ChevronRight, FileText
} from 'lucide-react';

const statusConfig = {
  held:     { label: '🔒 In Escrow (Pending)', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' },
  released: { label: '✅ Received / Paid',     color: 'text-green-400',  bg: 'bg-green-500/20',  border: 'border-green-500/30' },
  refunded: { label: '↩ Refunded',             color: 'text-blue-400',   bg: 'bg-blue-500/20',   border: 'border-blue-500/30' },
};

export default function CreatorEarningsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [totals, setTotals] = useState({ earned: 0, pending: 0 });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/payments/creator/all');
        setPayments(data.payments || []);
        setTotals({ earned: data.totalEarned || 0, pending: data.totalPending || 0 });
      } catch (err) {
        toast.error('Failed to load earnings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.status === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* 📱💻 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-white">My Earnings & Payouts</h1>
          <p className="text-gray-400 text-xs sm:text-sm">Track your escrow payments, received funds and settlement history</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 rounded-xl text-xs text-primary-300">
          <ShieldCheck size={16} className="text-primary-400 flex-shrink-0" />
          <span>100% Escrow Protection</span>
        </div>
      </div>

      {/* 📱💻 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Earned */}
        <div className="glass rounded-2xl p-4 sm:p-5 border border-green-500/20 bg-gradient-to-br from-green-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-semibold text-gray-300">Total Received</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle size={18} className="text-green-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-green-400 mb-0.5">
            ₹{totals.earned.toLocaleString()}
          </div>
          <div className="text-gray-400 text-[11px] sm:text-xs">Settled to your bank/UPI</div>
        </div>

        {/* In Escrow */}
        <div className="glass rounded-2xl p-4 sm:p-5 border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-semibold text-gray-300">In Escrow (Pending)</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lock size={18} className="text-yellow-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-yellow-400 mb-0.5">
            ₹{totals.pending.toLocaleString()}
          </div>
          <div className="text-gray-400 text-[11px] sm:text-xs">Held securely until brand approves work</div>
        </div>

        {/* Total Deals */}
        <div className="glass rounded-2xl p-4 sm:p-5 border border-primary-500/20 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-semibold text-gray-300">Paid Collaborations</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-primary-400" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-primary-400 mb-0.5">
            {payments.length}
          </div>
          <div className="text-gray-400 text-[11px] sm:text-xs">Total funded campaign deals</div>
        </div>
      </div>

      {/* 📱💻 How Escrow Works */}
      <div className="glass rounded-2xl p-4 sm:p-6 border border-dark-600">
        <h3 className="font-bold text-sm sm:text-base mb-3 flex items-center gap-2 text-white">
          <Wallet size={17} className="text-primary-400" /> How Escrow Payments Work on CreatorLens
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { step: '1', title: 'Brand Deposits Funds', desc: 'Brand pays into CreatorLens secure Escrow before you begin filming.' },
            { step: '2', title: 'You Submit Deliverable', desc: 'Upload your reel, video or post proof in the Content Submission section.' },
            { step: '3', title: 'Payment Released', desc: 'Once brand verifies content, escrow releases funds directly to you.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-dark-750/80 border border-dark-600 rounded-xl p-3 sm:p-3.5 flex sm:flex-col items-start gap-3 sm:gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary-500/20 text-primary-300 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step}
              </span>
              <div>
                <div className="font-bold text-xs sm:text-sm text-white">{title}</div>
                <div className="text-gray-400 text-[11px] leading-relaxed mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📱💻 Payment List & Filter */}
      <div className="glass rounded-2xl overflow-hidden border border-dark-600">
        <div className="p-4 sm:p-5 border-b border-dark-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white">Transaction & Payment History</h3>
            <p className="text-xs text-gray-400">Detailed records of deal payouts</p>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'released', label: 'Received' },
              { id: 'held', label: 'In Escrow' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  filter === tab.id 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-dark-700/80 text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <DollarSign size={40} className="mx-auto mb-3 opacity-20 text-primary-400" />
            <p className="font-medium text-gray-300">No payment transactions yet</p>
            <p className="text-xs text-gray-500 mt-1">Apply to campaigns to start landing funded brand deals</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-600">
            {filteredPayments.map(p => {
              const cfg = statusConfig[p.status] || statusConfig.held;
              const brandName = p.brand?.brandProfile?.companyName || p.brand?.name || 'Brand Partner';
              const campaignTitle = p.campaign?.title || 'Collaboration Deal';

              return (
                <div key={p._id || p.id} className="p-4 sm:p-5 hover:bg-dark-750/50 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Brand info & Campaign */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(brandName)}&background=22223A&color=4F63FF&size=44`}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex-shrink-0 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between sm:justify-start gap-2">
                          <span className="font-bold text-sm sm:text-base text-white truncate max-w-[160px] xs:max-w-[220px] sm:max-w-xs">
                            {brandName}
                          </span>
                          {/* Mobile Status Badge on top row */}
                          <span className={`sm:hidden text-[10px] px-2 py-0.5 rounded-lg font-mono font-medium ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 truncate">{campaignTitle}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                          ID: {p.transactionId || 'TXN-ESCROW'} • {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Amount & Desktop Status */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t border-dark-600/60 sm:border-0">
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-gray-400 sm:hidden">Payout Amount</div>
                        <div className="font-black text-lg sm:text-xl text-green-400">
                          ₹{p.creatorAmount?.toLocaleString() || p.amount?.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Total contract: ₹{p.amount?.toLocaleString()}
                        </div>
                      </div>

                      {/* Desktop Status Badge */}
                      <div className="hidden sm:flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`text-xs px-3 py-1 rounded-xl font-mono whitespace-nowrap font-medium ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
                          {cfg.label}
                        </span>
                        {p.status === 'held' && (
                          <Link
                            href="/dashboard/content"
                            className="text-[11px] text-primary-400 hover:text-primary-300 hover:underline flex items-center gap-0.5 font-medium"
                          >
                            Submit Deliverable <ArrowUpRight size={11} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Action Link for Escrow */}
                  {p.status === 'held' && (
                    <div className="mt-3 pt-2.5 border-t border-dark-600/50 sm:hidden flex items-center justify-between">
                      <span className="text-[11px] text-yellow-400/90 font-medium">Deliverable pending review</span>
                      <Link
                        href="/dashboard/content"
                        className="text-xs bg-primary-500/20 text-primary-300 hover:bg-primary-500/30 px-3 py-1 rounded-lg font-medium flex items-center gap-1"
                      >
                        Submit Content →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

