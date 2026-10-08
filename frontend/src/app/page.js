'use client';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  MessageSquare, 
  Zap, 
  Users, 
  Award, 
  Layers, 
  CheckCircle2, 
  BarChart3,
  Briefcase
} from 'lucide-react';

export default function Home() {
  const { user } = useSelector(state => state.auth);
  const router = useRouter();

  return (
    <div className="min-h-screen mesh-bg text-white selection:bg-primary-500 selection:text-white">
      {/* Sticky Navigation Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-dark-900/80 border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group no-underline">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-amber-400 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Zap className="text-white fill-current" size={20} />
            </div>
            <span style={{ 
              fontFamily: 'var(--font-syne)', 
              fontWeight: 800, 
              fontSize: 22, 
              background: 'linear-gradient(135deg, #4F63FF 0%, #FFD166 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>
              CreatorLens
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-primary-400 transition-colors">Features</a>
            <Link href="/creators" className="hover:text-primary-400 transition-colors">Find Creators</Link>
            <Link href="/campaigns" className="hover:text-primary-400 transition-colors">Browse Campaigns</Link>
            <a href="#how-it-works" className="hover:text-primary-400 transition-colors">How It Works</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link 
                href={user.role === 'admin' ? '/admin' : '/dashboard'} 
                className="btn-primary flex items-center gap-1.5 py-2 px-3.5 sm:px-5 text-xs sm:text-sm font-semibold shadow-lg shadow-primary-500/25"
              >
                <span>Dashboard</span> <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register" 
                  className="btn-primary flex items-center gap-1.5 py-2 px-3.5 sm:px-5 text-xs sm:text-sm font-semibold shadow-lg shadow-primary-500/25 hover:scale-105 transition-all"
                >
                  <span>Get Started</span> <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full glass border border-primary-500/30 text-primary-300 text-[11px] sm:text-xs font-semibold mb-6 sm:mb-8 uppercase tracking-wider animate-pulse">
            <Sparkles size={14} className="text-amber-400" />
            Next-Gen AI Influencer & Brand Ecosystem
          </div>

          <h1 className="text-3xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] mb-5 sm:mb-6">
            Scale Brand Deals with{' '}
            <span className="bg-gradient-to-r from-primary-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              AI Precision & Trust
            </span>
          </h1>

          <p className="text-sm sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-light px-2">
            CreatorLens bridges elite creators with verified brands. Experience automated AI audience vetting, real-time messaging, milestone tracking, and 100% escrow-backed payouts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 w-full max-w-md mx-auto sm:max-w-none">
            <Link 
              href="/auth/register?role=brand" 
              className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 font-bold shadow-xl shadow-primary-600/30 hover:scale-105 transition-all"
            >
              <Briefcase size={18} /> Post a Campaign as Brand
            </Link>
            <Link 
              href="/auth/register?role=creator" 
              className="w-full sm:w-auto glass hover:bg-white/10 text-white border border-white/20 flex items-center justify-center gap-2 text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold transition-all"
            >
              <Sparkles size={18} className="text-amber-400" /> Join as Creator
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 glass rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl">
            <div className="p-3 sm:p-4 text-center bg-white/[0.02] rounded-xl sm:rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-primary-400">12,500+</div>
              <div className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider">Verified Creators</div>
            </div>
            <div className="p-3 sm:p-4 text-center bg-white/[0.02] rounded-xl sm:rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">750+</div>
              <div className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider">Global Brands</div>
            </div>
            <div className="p-3 sm:p-4 text-center bg-white/[0.02] rounded-xl sm:rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">99.4%</div>
              <div className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider">Match Accuracy</div>
            </div>
            <div className="p-3 sm:p-4 text-center bg-white/[0.02] rounded-xl sm:rounded-2xl">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">₹3.8M+</div>
              <div className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wider">Creator Payouts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Highlights */}
      <section id="features" className="py-24 px-6 border-t border-white/10 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-3">Engineered for Performance</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold">All-in-One Creator Growth Engine</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-3xl border border-white/10 hover:border-primary-500/40 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp size={28} />
              </div>
              <h4 className="text-xl font-bold mb-3">AI Creator Intelligence</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Automated predictive scoring assessing follower authenticity, niche saturation, engagement rate, and historical ROI for zero-risk matchmaking.
              </p>
            </div>

            <div className="glass p-8 rounded-3xl border border-white/10 hover:border-primary-500/40 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare size={28} />
              </div>
              <h4 className="text-xl font-bold mb-3">Real-Time Messaging & Proposals</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Direct WebSocket-powered chat with instant proposal sending, rate negotiations, deliverable checklists, and real-time deal notifications.
              </p>
            </div>

            <div className="glass p-8 rounded-3xl border border-white/10 hover:border-primary-500/40 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <h4 className="text-xl font-bold mb-3">Escrow Protected Payouts</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Funds are locked safely in escrow upon contract agreement and automatically released once deliverables are submitted and approved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">Seamless Workflow</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold">How CreatorLens Delivers Results</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Post or Discover', desc: 'Brands post detailed campaign briefs or browse our curated directory of verified creators.' },
              { step: '02', title: 'AI Match & Score', desc: 'Our algorithm calculates compatibility scores based on audience demographics and engagement.' },
              { step: '03', title: 'Collaborate & Chat', desc: 'Discuss deliverables, exchange briefs, and formalize agreements via real-time encrypted chat.' },
              { step: '04', title: 'Deliver & Get Paid', desc: 'Creators submit live links, brands verify metrics, and escrow funds release automatically.' }
            ].map((item, idx) => (
              <div key={idx} className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="text-4xl font-extrabold text-white/10 mb-4">{item.step}</div>
                <h4 className="text-lg font-bold mb-2 text-white">{item.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-dark-900/90 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-amber-400 flex items-center justify-center">
              <Zap className="text-white fill-current" size={16} />
            </div>
            <span className="font-extrabold text-xl text-white">CreatorLens</span>
          </div>
          <div className="text-sm text-gray-500">
            &copy; 2026 CreatorLens Inc. All rights reserved. PBL Final Project.
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/creators" className="hover:text-white">Creators</Link>
            <Link href="/campaigns" className="hover:text-white">Campaigns</Link>
            <Link href="/auth/login" className="hover:text-white">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
