'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Upload, Link2, Plus, X, CheckCircle, Clock, RefreshCw, 
  AlertCircle, FileImage, Play, Video, Instagram, Copy, ExternalLink 
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
  submitted:         { label: 'Under Review', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Clock },
  under_review:      { label: 'Under Review', color: 'text-blue-400',   bg: 'bg-blue-500/20',   icon: Clock },
  approved:          { label: 'Approved',   color: 'text-green-400',  bg: 'bg-green-500/20',  icon: CheckCircle },
  revision_requested:{ label: 'Revision',   color: 'text-orange-400', bg: 'bg-orange-500/20', icon: RefreshCw },
  rejected:          { label: 'Rejected',   color: 'text-red-400',    bg: 'bg-red-500/20',    icon: X },
};

function SubmitModal({ application, onClose, onSuccess }) {
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    deliverable: application.campaign?.deliverables?.[0] || '1 Instagram Reel' 
  });
  const [links, setLinks] = useState([{ platform: 'instagram', url: '', type: 'reel' }]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const addPresetLink = (platform, type) => {
    setLinks([...links, { platform, url: '', type }]);
  };

  const removeLink = (i) => setLinks(links.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Please enter a submission title'); return; }
    if (links.every(l => !l.url?.trim()) && files.length === 0) {
      toast.error('Add your Instagram Reel link or upload video/proof files');
      return;
    }

    const appId = application._id || application.id;
    if (!appId) {
      toast.error('Application not found');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Submitting content to brand...');
    try {
      const formData = new FormData();
      formData.append('applicationId', String(appId));
      formData.append('title', form.title.trim());
      formData.append('description', form.description?.trim() || '');
      formData.append('deliverable', form.deliverable?.trim() || '');
      formData.append('contentLinks', JSON.stringify(links.filter(l => l.url?.trim())));
      files.forEach(f => formData.append('files', f));

      await api.post('/content/submit', formData);

      toast.success('Content submitted! Brand notified 🎉', { id: toastId });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="glass rounded-3xl p-5 sm:p-7 w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-600">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Submit Completed Work</h2>
            <p className="text-gray-400 text-xs mt-0.5">Upload reel links or video proof for brand verification</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-all">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Submission Title *</label>
            <input 
              className="input-field text-xs sm:text-sm py-2.5 rounded-xl" 
              placeholder="e.g. Comedy Reel with Brand Tag & Music" 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Deliverable Type</label>
            <input 
              className="input-field text-xs sm:text-sm py-2.5 rounded-xl" 
              placeholder="e.g. 1 Instagram Reel (as per contract)" 
              value={form.deliverable} 
              onChange={e => setForm({ ...form, deliverable: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Description / Highlights</label>
            <textarea 
              className="input-field h-18 text-xs sm:text-sm resize-none rounded-xl" 
              placeholder="Explain how the deliverables were met, tag details, reach highlights..." 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
            />
          </div>

          {/* 🔗 Content Links / Instagram Reel Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Instagram size={14} className="text-pink-400" /> Reel / Social Media Links
              </label>
              <div className="flex gap-1.5">
                <button 
                  type="button" 
                  onClick={() => addPresetLink('instagram', 'reel')} 
                  className="text-[11px] bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 px-2 py-0.5 rounded-lg flex items-center gap-0.5 transition-all"
                >
                  <Plus size={11} /> + Instagram Reel
                </button>
                <button 
                  type="button" 
                  onClick={() => addPresetLink('youtube', 'video')} 
                  className="text-[11px] bg-red-500/20 text-red-300 hover:bg-red-500/30 px-2 py-0.5 rounded-lg flex items-center gap-0.5 transition-all"
                >
                  <Plus size={11} /> + YouTube
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {links.map((link, i) => (
                <div key={i} className="bg-dark-700/80 border border-dark-600 rounded-xl p-2.5 sm:p-3 space-y-2 focus-within:border-primary-500 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      {/* Platform Select */}
                      <select
                        className="bg-dark-800 border border-dark-600 text-xs py-1.5 px-2.5 rounded-lg text-white focus:outline-none cursor-pointer"
                        value={link.platform}
                        onChange={e => { const l = [...links]; l[i].platform = e.target.value; setLinks(l); }}
                      >
                        <option value="instagram">Instagram</option>
                        <option value="youtube">YouTube</option>
                        <option value="twitter">Twitter / X</option>
                        <option value="tiktok">TikTok</option>
                        <option value="other">Other Link</option>
                      </select>

                      {/* Type Select */}
                      <select
                        className="bg-dark-800 border border-dark-600 text-xs py-1.5 px-2.5 rounded-lg text-white focus:outline-none cursor-pointer"
                        value={link.type}
                        onChange={e => { const l = [...links]; l[i].type = e.target.value; setLinks(l); }}
                      >
                        <option value="reel">Reel</option>
                        <option value="post">Post</option>
                        <option value="story">Story</option>
                        <option value="video">Video</option>
                      </select>
                    </div>

                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(i)}
                        className="text-gray-400 hover:text-red-400 p-1 transition-colors"
                        title="Remove Link"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* URL Input */}
                  <div className="relative">
                    <input
                      className="input-field text-xs py-2 px-3 rounded-lg w-full"
                      placeholder="https://www.instagram.com/reel/..."
                      value={link.url}
                      onChange={e => { const l = [...links]; l[i].url = e.target.value; setLinks(l); }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 📁 File Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">Direct Video Upload / Proof Screenshots</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-dark-600 hover:border-primary-500 bg-dark-750 hover:bg-dark-700/50 rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all group"
            >
              <FileImage size={28} className="mx-auto mb-1.5 text-gray-400 group-hover:text-primary-400 transition-colors" />
              <p className="text-gray-200 text-xs sm:text-sm font-medium">Click to select video or image proof</p>
              <p className="text-gray-500 text-[11px] mt-0.5">MP4, MOV, WebM, PNG, JPG (Max 50MB)</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              className="hidden"
              onChange={e => setFiles(Array.from(e.target.files || []))}
            />
            {files.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-dark-700/90 border border-dark-600 rounded-xl px-3 py-2 text-xs">
                    {f.type.startsWith('video') ? (
                      <Video size={14} className="text-primary-400 flex-shrink-0" />
                    ) : (
                      <FileImage size={14} className="text-blue-400 flex-shrink-0" />
                    )}
                    <span className="flex-1 truncate font-medium text-gray-200">{f.name}</span>
                    <span className="text-gray-500 text-[10px]">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="p-1 text-gray-400 hover:text-red-400">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2.5 mt-5 pt-3 border-t border-dark-600">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-xs sm:text-sm rounded-xl">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 py-2.5 text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <Upload size={15} />}
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreatorContentPage() {
  const [submissions, setSubmissions] = useState([]);
  const [acceptedApps, setAcceptedApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchData = async () => {
    try {
      const [subRes, appRes] = await Promise.all([
        api.get('/content/creator/all'),
        api.get('/applications/my')
      ]);
      setSubmissions(subRes.data.submissions || []);
      setAcceptedApps(appRes.data.applications?.filter(a => ['accepted', 'shortlisted', 'pending'].includes(a.status)) || []);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">My Content Submissions</h1>
        <p className="text-gray-400 text-xs sm:text-sm">Submit your deliverables, paste reel links & track brand approvals</p>
      </div>

      {/* Accepted campaigns ready to submit */}
      {acceptedApps.length > 0 && (
        <div className="glass rounded-2xl p-4 sm:p-6 border border-green-500/20">
          <h3 className="font-bold text-base sm:text-lg mb-3 flex items-center gap-2 text-white">
            <CheckCircle size={18} className="text-green-400" />
            Active Deals Ready for Submission ({acceptedApps.length})
          </h3>
          <div className="space-y-3">
            {acceptedApps.map(app => (
              <div key={app._id || app.id} className="bg-dark-750 border border-dark-600 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm sm:text-base text-white">{app.campaign?.title || 'Campaign'}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Brand: <strong className="text-gray-300">{app.brand?.name || 'Brand'}</strong> • Deal: <strong className="text-green-400">₹{app.dealAmount?.toLocaleString() || app.proposedRate?.toLocaleString()}</strong>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedApp(app); setShowModal(true); }}
                  className="btn-primary text-xs sm:text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap self-start sm:self-auto px-4 py-2.5 rounded-xl shadow-md active:scale-95"
                >
                  <Upload size={14} /> Submit Reel / Content
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submitted content list */}
      <div className="glass rounded-2xl overflow-hidden border border-dark-600">
        <div className="p-4 sm:p-6 border-b border-dark-600">
          <h3 className="font-bold text-base sm:text-lg text-white">Submission History & Approvals</h3>
        </div>

        {submissions.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Upload size={40} className="mx-auto mb-3 opacity-20 text-primary-400" />
            <p className="font-medium text-gray-300">No submissions yet</p>
            <p className="text-xs text-gray-500 mt-1">Submit content for your accepted campaign deals above</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-600">
            {submissions.map(sub => {
              const cfg = statusConfig[sub.status] || statusConfig.submitted;
              const Icon = cfg.icon;
              return (
                <div key={sub._id} className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <h4 className="font-bold text-base text-white">{sub.title}</h4>
                      <div className="text-xs text-gray-400 mt-0.5">{sub.campaign?.title}</div>
                      <div className="text-[11px] text-gray-500">Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`flex items-center gap-1 text-[11px] sm:text-xs px-2.5 py-1 rounded-xl font-medium whitespace-nowrap ${cfg.bg} ${cfg.color}`}>
                      <Icon size={12} /> {cfg.label}
                    </span>
                  </div>

                  {sub.deliverable && (
                    <div className="text-xs text-primary-400 mb-2 font-medium">📦 Deliverable: {sub.deliverable}</div>
                  )}

                  {sub.description && (
                    <p className="text-gray-300 text-xs sm:text-sm mb-3">{sub.description}</p>
                  )}

                  {/* Links */}
                  {sub.contentLinks?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {sub.contentLinks.map((l, i) => (
                        <a
                          key={i}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30 px-3 py-1.5 rounded-xl hover:bg-pink-500/30 transition-all font-medium"
                        >
                          <Instagram size={13} />
                          {l.platform} {l.type} ↗
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Files */}
                  {sub.files?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {sub.files.map((f, i) => (
                        <a
                          key={i}
                          href={getFileUrl(f.filePath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-dark-600 transition-all"
                        >
                          <FileImage size={12} className="text-primary-400" />
                          {f.filename} ↗
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Brand feedback */}
                  {sub.brandFeedback && (
                    <div className={`p-3 rounded-xl text-xs sm:text-sm my-2 border ${
                      sub.status === 'approved' ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                      sub.status === 'rejected' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                      'bg-orange-500/10 border-orange-500/30 text-orange-300'
                    }`}>
                      <strong>Brand Feedback:</strong> {sub.brandFeedback}
                    </div>
                  )}

                  {sub.revisionNote && (
                    <div className="p-3 rounded-xl text-xs sm:text-sm bg-orange-500/10 border border-orange-500/30 text-orange-300">
                      <strong>Revision Instructions:</strong> {sub.revisionNote}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selectedApp && (
        <SubmitModal
          application={selectedApp}
          onClose={() => { setShowModal(false); setSelectedApp(null); }}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}

