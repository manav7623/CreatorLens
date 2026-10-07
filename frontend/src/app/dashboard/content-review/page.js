'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  CheckCircle, RefreshCw, X, Link2, FileImage, Eye, CreditCard, 
  Play, Video, Instagram, Copy, ExternalLink, MessageSquare, AlertCircle
} from 'lucide-react';

const getFileUrl = (filePath) => {
  if (!filePath) return '';
  let cleanPath = filePath.replace(/\\/g, '/');
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) return cleanPath;
  
  const uploadsIdx = cleanPath.indexOf('/uploads/');
  if (uploadsIdx !== -1) {
    cleanPath = cleanPath.substring(uploadsIdx);
  } else if (cleanPath.indexOf('uploads/') !== -1) {
    cleanPath = '/' + cleanPath.substring(cleanPath.indexOf('uploads/'));
  } else if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  const base = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://creatorlens-hydg.onrender.com';
  return `${base.replace(/\/$/, '')}${cleanPath}`;
};

const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const statusConfig = {
  submitted:          { label: 'New Submission', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  under_review:       { label: 'Under Review',   color: 'text-blue-400',   bg: 'bg-blue-500/20' },
  approved:           { label: 'Approved',     color: 'text-green-400',  bg: 'bg-green-500/20' },
  revision_requested: { label: 'Revision',     color: 'text-orange-400', bg: 'bg-orange-500/20' },
  rejected:           { label: 'Rejected',     color: 'text-red-400',    bg: 'bg-red-500/20' },
};

function MediaDisplaySection({ submission }) {
  const contentLinks = submission.contentLinks || [];
  const files = submission.files || [];
  const hasMedia = contentLinks.length > 0 || files.length > 0;

  if (!hasMedia) {
    return (
      <div className="bg-dark-800/60 rounded-2xl p-4 border border-dark-600 text-center my-3">
        <AlertCircle size={24} className="mx-auto mb-2 text-yellow-400/70" />
        <p className="text-xs text-gray-300 font-medium">Text notes submitted with deliverable: <span className="text-primary-400 font-semibold">{submission.deliverable || 'Reel/Post'}</span></p>
        <p className="text-[11px] text-gray-500 mt-0.5">Creator provided title and description above. You can approve or request revisions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 my-3">
      {/* 🎬 Render Content Links */}
      {contentLinks.map((l, i) => {
        const isInsta = l.platform === 'instagram' || (l.url && l.url.toLowerCase().includes('instagram.com'));
        const isYt = l.platform === 'youtube' || (l.url && (l.url.toLowerCase().includes('youtube.com') || l.url.toLowerCase().includes('youtu.be')));
        const ytId = isYt ? getYouTubeVideoId(l.url) : null;

        if (isInsta) {
          return (
            <div key={i} className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-br from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20 border border-[#fd1d1d]/40 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#fd5949] via-[#d6249f] to-[#285AEB] flex items-center justify-center text-white shadow-md flex-shrink-0">
                    <Instagram size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      Instagram {l.type ? l.type.toUpperCase() : 'REEL'}
                      <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                    </div>
                    <p className="text-[11px] text-gray-300 truncate max-w-[190px] xs:max-w-[260px] sm:max-w-md">{l.url}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/30 text-pink-300 font-semibold uppercase flex-shrink-0">
                  Live Reel
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
                >
                  <Play size={14} className="fill-white" /> Watch Reel on Instagram ↗
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(l.url);
                    toast.success('Reel link copied!');
                  }}
                  className="py-2 px-3 bg-dark-800/90 hover:bg-dark-700 text-gray-300 hover:text-white rounded-xl text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-all active:scale-98"
                  title="Copy Link"
                >
                  <Copy size={13} /> Copy Link
                </button>
              </div>
            </div>
          );
        }

        if (ytId) {
          return (
            <div key={i} className="rounded-2xl overflow-hidden border border-dark-600 bg-black shadow-lg">
              <div className="p-2.5 bg-dark-800 border-b border-dark-600 flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Play size={14} className="text-red-500 fill-red-500" /> YouTube Video / Short
                </span>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:underline flex items-center gap-0.5 font-medium">
                  Watch on YouTube ↗
                </a>
              </div>
              <div className="aspect-video w-full">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                  title="YouTube video player"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          );
        }

        return (
          <a
            key={i}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 p-3 bg-dark-600/80 hover:bg-dark-600 border border-dark-500 rounded-xl text-primary-400 text-xs font-medium transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <Link2 size={14} className="flex-shrink-0" />
              <span className="capitalize font-bold text-white">{l.platform} ({l.type}):</span>
              <span className="truncate text-gray-300">{l.url}</span>
            </div>
            <ExternalLink size={13} className="flex-shrink-0" />
          </a>
        );
      })}

      {/* 📹 Render Uploaded Files / Videos / Images */}
      {files.map((f, i) => {
        const url = getFileUrl(f.filePath);
        const isVideo = f.fileType?.startsWith('video') || (f.filename && /\.(mp4|mov|webm|avi|mkv)$/i.test(f.filename));
        const isImage = f.fileType?.startsWith('image') || (f.filename && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.filename));

        if (isVideo) {
          return (
            <div key={i} className="rounded-2xl overflow-hidden border border-dark-600 bg-black shadow-lg">
              <div className="p-2.5 bg-dark-800 border-b border-dark-600 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-200 truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5">
                  <Video size={14} className="text-primary-400" /> {f.filename}
                </span>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-400 hover:underline font-medium">
                  Full Video ↗
                </a>
              </div>
              <video
                src={url}
                controls
                playsInline
                preload="metadata"
                className="w-full max-h-80 sm:max-h-96 object-contain bg-black"
              />
            </div>
          );
        }

        if (isImage) {
          return (
            <div key={i} className="rounded-2xl overflow-hidden border border-dark-600 bg-dark-800 shadow-md">
              <div className="p-2.5 bg-dark-800 border-b border-dark-600 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-200 truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5">
                  <FileImage size={14} className="text-blue-400" /> {f.filename}
                </span>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline font-medium">
                  Full Image ↗
                </a>
              </div>
              <div className="p-2 bg-black/40 flex items-center justify-center">
                <img
                  src={url}
                  alt={f.filename}
                  className="max-h-72 w-full object-contain rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => window.open(url, '_blank')}
                />
              </div>
            </div>
          );
        }

        return (
          <div key={i} className="p-3 bg-dark-700 rounded-xl flex items-center justify-between text-xs border border-dark-600">
            <span className="text-gray-300 font-medium truncate flex-1">{f.filename}</span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline font-semibold ml-2">
              Download File ↗
            </a>
          </div>
        );
      })}
    </div>
  );
}

function ReviewModal({ submission, onClose, onAction }) {
  const [action, setAction] = useState('');
  const [feedback, setFeedback] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!feedback && action !== 'approve') { toast.error('Please add feedback'); return; }
    setLoading(true);
    try {
      if (action === 'approve') {
        const res = await api.put(`/content/approve/${submission._id}`, { feedback: feedback || 'Great work!' });
        toast.success('Content approved!');
        if (res.data.paymentReady) {
          toast('Payment is ready to release! Go to Payments page.', { icon: '💳' });
        }
      } else if (action === 'revision') {
        await api.put(`/content/revision/${submission._id}`, { note: revisionNote, feedback });
        toast.success('Revision requested. Creator notified.');
      } else if (action === 'reject') {
        await api.put(`/content/reject/${submission._id}`, { feedback });
        toast.success('Content rejected.');
      }
      onAction();
      onClose();
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="glass rounded-3xl p-5 sm:p-7 w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-600">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Review Creator Content</h2>
            <p className="text-xs text-gray-400 mt-0.5">Inspect reel/proof before approving & releasing payment</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-all">
            <X size={22} />
          </button>
        </div>

        {/* Content details box */}
        <div className="bg-dark-750 rounded-2xl p-4 mb-4 border border-dark-600">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="font-bold text-base sm:text-lg text-white">{submission.title}</h4>
            {submission.deliverable && (
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-primary-500/20 text-primary-300 font-semibold flex-shrink-0">
                📦 {submission.deliverable}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-400 mb-2.5 flex items-center gap-1.5">
            <span>By <strong className="text-gray-200">{submission.creator?.name}</strong></span>
            <span>•</span>
            <span className="text-gray-400">{submission.campaign?.title || 'Campaign'}</span>
          </div>

          {submission.description && (
            <div className="p-3 bg-dark-800/80 rounded-xl border border-dark-600/70 text-xs sm:text-sm text-gray-300 leading-relaxed mb-3">
              {submission.description}
            </div>
          )}

          {/* 📱💻 Rich Media Preview (Reel / Video / Image) */}
          <MediaDisplaySection submission={submission} />
        </div>

        {/* Action Buttons */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 mb-2">Select Your Decision:</p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { id: 'approve', label: 'Approve & Release', bg: 'bg-green-500/20 border-green-500/50 text-green-400' },
              { id: 'revision', label: 'Request Revision', bg: 'bg-orange-500/20 border-orange-500/50 text-orange-400' },
              { id: 'reject', label: 'Reject', bg: 'bg-red-500/20 border-red-500/50 text-red-400' },
            ].map(a => (
              <button
                key={a.id}
                onClick={() => setAction(a.id)}
                className={`py-3 px-2 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all active:scale-95 ${a.bg} ${
                  action === a.id ? 'opacity-100 ring-2 ring-white/30 scale-102' : 'opacity-60 hover:opacity-90'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {action && (
          <div className="space-y-3 pt-2 border-t border-dark-600">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                {action === 'approve' ? 'Feedback Note for Creator (Optional)' : 'Feedback for Creator *'}
              </label>
              <textarea
                className="input-field h-20 text-xs sm:text-sm resize-none rounded-xl"
                placeholder={
                  action === 'approve' ? 'Awesome reel! Exactly what we envisioned.' :
                  action === 'revision' ? 'Please adjust the lighting and mention our coupon code...' :
                  'Unfortunately this submission does not match our brand guidelines...'
                }
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
            </div>

            {action === 'revision' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Specific Revision Requirement</label>
                <textarea
                  className="input-field h-16 text-xs sm:text-sm resize-none rounded-xl"
                  placeholder="e.g. Add company watermark at 0:15 and update the soundtrack..."
                  value={revisionNote}
                  onChange={e => setRevisionNote(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-2.5 pt-1">
              <button onClick={onClose} className="btn-secondary py-2.5 flex-1 text-xs sm:text-sm rounded-xl">Cancel</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary py-2.5 flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm rounded-xl">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Decision'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ContentReviewPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    try {
      const { data } = await api.get('/content/brand/all');
      setSubmissions(data.submissions || []);
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filter === 'all' ? submissions :
    submissions.filter(s => s.status === filter);

  const pendingCount = submissions.filter(s => s.status === 'submitted').length;

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Review Creator Content</h1>
          <p className="text-gray-400 text-xs sm:text-sm">Verify creator submissions, play reels & release escrow payments</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-yellow-500/20 text-yellow-400 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-semibold self-start sm:self-auto">
            <Eye size={16} /> {pendingCount} new submission{pendingCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-4 sm:p-5 border border-primary-500/20">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center text-xs sm:text-sm">
          <div>
            <div className="font-bold text-lg sm:text-2xl text-white">1. Review</div>
            <div className="text-gray-400 text-[11px] sm:text-xs">Watch reel or verify deliverables</div>
          </div>
          <div>
            <div className="font-bold text-lg sm:text-2xl text-white">2. Approve</div>
            <div className="text-gray-400 text-[11px] sm:text-xs">Accept or request revision</div>
          </div>
          <div>
            <div className="font-bold text-lg sm:text-2xl text-white">3. Release</div>
            <div className="text-gray-400 text-[11px] sm:text-xs">Release funds securely</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'submitted', 'approved', 'revision_requested', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl capitalize transition-all font-medium ${
              filter === s ? 'bg-primary-500 text-white shadow-md' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
            }`}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ')}
            {s === 'submitted' && pendingCount > 0 && (
              <span className="ml-1.5 bg-yellow-400 text-dark-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Submissions list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-gray-400">
            <Eye size={40} className="mx-auto mb-3 opacity-25 text-primary-400" />
            <p className="font-medium text-gray-300">No submissions found</p>
            <p className="text-xs text-gray-500 mt-1">Creators will submit content here once hired on campaigns</p>
          </div>
        ) : (
          filtered.map(sub => {
            const cfg = statusConfig[sub.status] || statusConfig.submitted;
            return (
              <div key={sub._id} className="glass rounded-2xl p-4 sm:p-6 border border-dark-600 hover:border-dark-500 transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(sub.creator?.name || 'C')}&background=4F63FF&color=fff&size=44`}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex-shrink-0 object-cover"
                    />
                    <div>
                      <div className="font-bold text-base sm:text-lg text-white">{sub.title}</div>
                      <div className="text-gray-400 text-xs">by <strong className="text-gray-200">{sub.creator?.name}</strong> • {sub.campaign?.title}</div>
                      <div className="text-[11px] text-gray-500">{new Date(sub.submittedAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <span className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-xl font-mono whitespace-nowrap font-medium ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>

                {sub.deliverable && (
                  <div className="text-xs sm:text-sm text-primary-400 mb-2 font-medium">📦 Deliverable: {sub.deliverable}</div>
                )}
                
                {sub.description && (
                  <p className="text-gray-300 text-xs sm:text-sm mb-3">{sub.description}</p>
                )}

                {/* Inline Media Preview inside card */}
                <MediaDisplaySection submission={sub} />

                {sub.brandFeedback && (
                  <div className="bg-dark-700/80 border border-dark-600 rounded-xl p-3 text-xs text-gray-300 my-3">
                    <span className="text-gray-400 font-semibold">Your Feedback: </span>{sub.brandFeedback}
                  </div>
                )}

                {/* Bottom Action Triggers */}
                <div className="mt-4 pt-3 border-t border-dark-600 flex flex-wrap items-center gap-3">
                  {(sub.status === 'submitted' || sub.status === 'under_review') && (
                    <button
                      onClick={() => setReviewing(sub)}
                      className="btn-primary text-xs sm:text-sm py-2.5 px-4 flex items-center gap-2 rounded-xl"
                    >
                      <Eye size={15} /> Review & Approve Content
                    </button>
                  )}

                  {sub.status === 'approved' && (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-green-400 text-xs sm:text-sm flex items-center gap-1 font-semibold">
                        <CheckCircle size={15} /> Content Approved
                      </span>
                      <button
                        onClick={() => window.location.href = '/dashboard/payments'}
                        className="text-xs sm:text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 font-medium border border-green-500/30"
                      >
                        <CreditCard size={14} /> Release Payment →
                      </button>
                    </div>
                  )}

                  {sub.status === 'revision_requested' && (
                    <span className="text-orange-400 text-xs flex items-center gap-1">
                      <RefreshCw size={13} className="animate-spin" /> Waiting for Creator Revision
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {reviewing && (
        <ReviewModal
          submission={reviewing}
          onClose={() => setReviewing(null)}
          onAction={fetchData}
        />
      )}
    </div>
  );
}

