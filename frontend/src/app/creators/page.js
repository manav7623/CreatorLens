'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Search, Shield, Zap, Users, TrendingUp, MapPin, Instagram, Youtube, Twitter, MessageSquare } from 'lucide-react';

const NICHES = ['Tech', 'Fashion', 'Travel', 'Food', 'Fitness', 'Beauty', 'Gaming', 'Education', 'Finance', 'Lifestyle'];

function CreatorCard({ creator }) {
  const [showDetail, setShowDetail] = useState(false);
  const p = creator.creatorProfile || {};
  const score = p.aiScore || 0;
  const scoreColor = score >= 75 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = score >= 75 ? 'bg-green-500/20' : score >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20';
  const creatorId = creator._id || creator.id;

  return (
    <>
      <div className="glass rounded-2xl p-6 card-hover cursor-pointer" onClick={() => setShowDetail(true)}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <img
            src={creator.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=4F63FF&color=fff&size=64`}
            className="w-14 h-14 rounded-2xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg">{creator.name}</span>
              {creator.isVerified && <Shield size={14} className="text-green-400" />}
              {p.isFeatured && (
                <span className="text-xs bg-accent-500/20 text-accent-400 px-2 py-0.5 rounded-full">Featured</span>
              )}
            </div>
            {p.location && (
              <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                <MapPin size={12} /> {p.location}
              </div>
            )}
            <div className="flex flex-wrap gap-1 mt-1">
              {p.niche?.slice(0, 3).map(n => (
                <span key={n} className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">{n}</span>
              ))}
            </div>
          </div>
          <div className={`text-center px-3 py-2 rounded-xl ${scoreBg}`}>
            <div className={`text-2xl font-bold ${scoreColor}`}>{score}</div>
            <div className="text-xs text-gray-400">AI Score</div>
          </div>
        </div>

        {p.bio && <p className="text-gray-400 text-sm mb-4 line-clamp-2">{p.bio}</p>}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-dark-700 rounded-xl p-2.5 text-center">
            <div className="text-sm font-bold">{(p.totalFollowers || 0).toLocaleString()}</div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
          <div className="bg-dark-700 rounded-xl p-2.5 text-center">
            <div className={`text-sm font-bold ${(p.engagementRate || 0) >= 3 ? 'text-green-400' : 'text-yellow-400'}`}>
              {p.engagementRate || 0}%
            </div>
            <div className="text-xs text-gray-500">Engagement</div>
          </div>
          <div className="bg-dark-700 rounded-xl p-2.5 text-center">
            <div className={`text-sm font-bold ${(p.fakeFollowerPercentage || 0) < 20 ? 'text-green-400' : 'text-red-400'}`}>
              {p.fakeFollowerPercentage || 0}%
            </div>
            <div className="text-xs text-gray-500">Fake Flwrs</div>
          </div>
        </div>

        {/* Social Links & Message Button */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-dark-600">
          <div className="flex gap-3 items-center text-gray-400">
            {p.socialLinks?.instagram?.username && (
              <div className="flex items-center gap-1 text-xs">
                <Instagram size={12} className="text-pink-400" />
                @{p.socialLinks.instagram.username}
              </div>
            )}
            {p.socialLinks?.youtube?.username && (
              <div className="flex items-center gap-1 text-xs">
                <Youtube size={12} className="text-red-400" />
                {p.socialLinks.youtube.username}
              </div>
            )}
          </div>

          <Link
            href={`/messages?user=${creatorId}`}
            onClick={e => e.stopPropagation()}
            className="btn-primary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <MessageSquare size={13} /> Message
          </Link>
        </div>

        {p.rateCard?.postRate > 0 && (
          <div className="mt-3 pt-2 border-t border-dark-700/60 flex gap-4 text-xs text-gray-400">
            <span>Post: <span className="text-accent-400 font-semibold">₹{p.rateCard.postRate?.toLocaleString()}</span></span>
            {p.rateCard.videoRate > 0 && (
              <span>Video: <span className="text-accent-400 font-semibold">₹{p.rateCard.videoRate?.toLocaleString()}</span></span>
            )}
          </div>
        )}
      </div>

        {/* Detail Modal */}
        {showDetail && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onClick={() => setShowDetail(false)}>
            <div className="glass bg-dark-900 border border-dark-600 rounded-3xl p-5 sm:p-7 w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <img
                    src={creator.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=4F63FF&color=fff&size=80`}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-1 ring-primary-500/30 flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold text-white">{creator.name}</h2>
                      {creator.isVerified && <Shield size={16} className="text-green-400" />}
                    </div>
                    {p.location && <div className="text-gray-400 text-xs sm:text-sm flex items-center gap-1"><MapPin size={13} />{p.location}</div>}
                    <p className="text-gray-300 text-xs sm:text-sm mt-1.5 leading-relaxed">{p.bio}</p>
                  </div>
                </div>

                <Link
                  href={`/messages?user=${creatorId}`}
                  className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md w-full sm:w-auto flex-shrink-0 font-semibold"
                >
                  <MessageSquare size={14} /> Message Creator
                </Link>
              </div>

              {/* Detailed Analytics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
                {[
                  { label: 'AI Score', value: `${p.aiScore || 0}/100`, color: scoreColor },
                  { label: 'Followers', value: (p.totalFollowers || 0).toLocaleString(), color: 'text-blue-400' },
                  { label: 'Engagement', value: `${p.engagementRate || 0}%`, color: 'text-green-400' },
                  { label: 'Fake Followers', value: `${p.fakeFollowerPercentage || 0}%`, color: (p.fakeFollowerPercentage || 0) < 20 ? 'text-green-400' : 'text-red-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-dark-700 rounded-xl p-2.5 sm:p-3 text-center">
                    <div className={`text-base sm:text-xl font-bold ${color}`}>{value}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Audience Locations */}
              {p.audienceLocations?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2.5 text-xs text-gray-400 font-mono uppercase tracking-wider">AUDIENCE LOCATIONS</h4>
                  <div className="space-y-2">
                    {p.audienceLocations.slice(0, 4).map(loc => (
                      <div key={loc.country} className="flex items-center gap-3">
                        <span className="text-xs sm:text-sm w-16 text-gray-400">{loc.country}</span>
                        <div className="flex-1 bg-dark-700 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${loc.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-400 w-8 text-right">{loc.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Platforms */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2.5 text-xs text-gray-400 font-mono uppercase tracking-wider">CONNECTED PLATFORMS</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {p.socialLinks?.instagram?.username && (
                    <div className="bg-dark-700 rounded-xl p-3 flex items-center gap-2.5">
                      <Instagram size={18} className="text-pink-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-medium truncate">@{p.socialLinks.instagram.username}</div>
                        <div className="text-[11px] text-gray-400">{(p.socialLinks.instagram.followers || 0).toLocaleString()} followers</div>
                      </div>
                    </div>
                  )}
                  {p.socialLinks?.youtube?.username && (
                    <div className="bg-dark-700 rounded-xl p-3 flex items-center gap-2.5">
                      <Youtube size={18} className="text-red-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-medium truncate">{p.socialLinks.youtube.username}</div>
                        <div className="text-[11px] text-gray-400">{(p.socialLinks.youtube.subscribers || 0).toLocaleString()} subscribers</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-dark-600">
                <button onClick={() => setShowDetail(false)} className="btn-secondary flex-1 py-2.5 text-xs sm:text-sm rounded-xl">Close</button>
                <Link href={`/messages?user=${creatorId}`} className="btn-primary flex-1 py-2.5 text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 font-semibold">
                  <MessageSquare size={15} /> Chat Directly
                </Link>
              </div>
            </div>
          </div>
        )}
    </>
  );
}

export default function CreatorsPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    niche: '', minFollowers: '', maxFollowers: '', minEngagement: '', location: '', sort: 'aiScore'
  });

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, ...filters });
      const { data } = await api.get(`/users/creators?${params}`);
      setCreators(data.creators);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchCreators, 400);
    return () => clearTimeout(t);
  }, [search, filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Find Creators</h1>
        <p className="text-gray-400 text-xs sm:text-sm">{total} verified creators ready to collaborate</p>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="input-field py-2.5 text-xs sm:text-sm rounded-xl"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search creators by name or niche..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="input-field py-2.5 text-xs sm:text-sm w-full sm:w-36 rounded-xl" value={filters.niche} onChange={e => setFilters({ ...filters, niche: e.target.value })}>
            <option value="">All Niches</option>
            {NICHES.map(n => <option key={n}>{n}</option>)}
          </select>

          <input type="number" className="input-field py-2.5 text-xs sm:text-sm w-full sm:w-32 rounded-xl" placeholder="Min Followers" value={filters.minFollowers} onChange={e => setFilters({ ...filters, minFollowers: e.target.value })} />
          <input type="number" className="input-field py-2.5 text-xs sm:text-sm w-full sm:w-32 rounded-xl" placeholder="Min ER%" value={filters.minEngagement} onChange={e => setFilters({ ...filters, minEngagement: e.target.value })} />

          <select className="input-field py-2.5 text-xs sm:text-sm w-full sm:w-36 rounded-xl" value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })}>
            <option value="aiScore">Sort: AI Score</option>
            <option value="followers">Sort: Followers</option>
            <option value="engagement">Sort: Engagement</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users size={40} className="mx-auto mb-4 opacity-30" />
          <p>No creators found. Try adjusting filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {creators.map(creator => (
            <CreatorCard key={creator._id} creator={creator} />
          ))}
        </div>
      )}
    </div>
  );
}
