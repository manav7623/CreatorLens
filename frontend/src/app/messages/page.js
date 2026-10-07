'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { io } from 'socket.io-client';
import { 
  Send, MessageSquare, Trash2, ArrowLeft, Paperclip, 
  Search, Plus, User, Sparkles, X, CheckCircle, Shield
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';

function MessagesContent() {
  const { user, isInitialized } = useSelector(state => state.auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetAppId = searchParams.get('app') || searchParams.get('applicationId');
  const targetUserId = searchParams.get('user') || searchParams.get('userId') || searchParams.get('creatorId') || searchParams.get('brandId');

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'deals', 'direct'
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const messagesEndRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const currentUserId = String(user?._id || user?.id);
    fetchConversations(targetAppId, targetUserId);

    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://creatorlens-hydg.onrender.com';
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      socketUrl = 'http://localhost:5000';
    }

    let socketInstance;
    try {
      socketInstance = io(socketUrl, {
        reconnectionAttempts: 5,
        timeout: 10000,
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        socketInstance.emit('join', currentUserId);
      });

      setSocket(socketInstance);
    } catch (err) {
      console.warn('Socket connection fallback to polling/HTTP:', err);
    }

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, [user, isInitialized, router, targetAppId, targetUserId]);

  // Real-time Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (msg) => {
      const convId = String(msg.conversationId || msg.applicationId || (msg.application?._id || msg.application?.id || msg.application || ''));
      const selId = String(selectedConv?._id || selectedConv?.id || selectedConv?.conversationId || '');
      
      if (selectedConv && (convId === selId || isMatchingDirectConv(convId, selectedConv))) {
        setMessages(prev => {
          if (prev.some(m => String(m._id || m.id) === String(msg._id || msg.id))) return prev;
          return [...prev, msg];
        });
      }
      fetchConversationsQuietly();
    };

    const handleMessagesCleared = (data) => {
      const selId = String(selectedConv?._id || selectedConv?.id || selectedConv?.conversationId || '');
      const clearedId = String(data.applicationId || data.conversationId || '');
      if (selectedConv && (clearedId === selId || isMatchingDirectConv(clearedId, selectedConv))) {
        setMessages([]);
        toast('Chat cleared by the other party', { icon: '🧹' });
      }
      fetchConversationsQuietly();
    };

    socket.on('receive_message', handleIncomingMessage);
    socket.on('receiveMessage', handleIncomingMessage);
    socket.on('messages_cleared', handleMessagesCleared);

    return () => {
      socket.off('receive_message', handleIncomingMessage);
      socket.off('receiveMessage', handleIncomingMessage);
      socket.off('messages_cleared', handleMessagesCleared);
    };
  }, [socket, selectedConv, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isMatchingDirectConv = (convId, currentConv) => {
    if (!convId || !currentConv) return false;
    const currentId = String(currentConv._id || currentConv.id || currentConv.conversationId || '');
    if (convId === currentId) return true;
    return false;
  };

  const fetchConversationsQuietly = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data.conversations || []);
    } catch (e) {
      // quiet fail
    }
  };

  const fetchConversations = async (autoSelectAppId, autoSelectUserId) => {
    try {
      const { data } = await api.get('/messages/conversations');
      const convList = data.conversations || [];
      setConversations(convList);

      const currentUserId = Number(user?._id || user?.id);

      // Case A: Select by target Application ID
      if (autoSelectAppId) {
        const found = convList.find(c => String(c._id || c.id) === String(autoSelectAppId));
        if (found) {
          selectConversation(found);
          return;
        } else {
          try {
            const appRes = await api.get(`/applications/${autoSelectAppId}`);
            if (appRes.data.application) {
              const newAppConv = {
                ...appRes.data.application,
                isDirect: false,
                id: appRes.data.application.id || appRes.data.application._id,
                _id: appRes.data.application.id || appRes.data.application._id,
              };
              setConversations(prev => [newAppConv, ...prev]);
              selectConversation(newAppConv);
              return;
            }
          } catch (e) {
            console.error('Failed to load application directly:', e);
          }
        }
      }

      // Case B: Select by target User ID
      if (autoSelectUserId) {
        const targetId = Number(autoSelectUserId);
        const directId = `direct_${Math.min(currentUserId, targetId)}_${Math.max(currentUserId, targetId)}`;
        
        const existingDirect = convList.find(c => {
          const cId = String(c._id || c.id || c.conversationId || '');
          if (cId === directId) return true;
          const other = getOtherParty(c);
          return Number(other?.id || other?._id) === targetId;
        });

        if (existingDirect) {
          selectConversation(existingDirect);
          return;
        } else {
          // Fetch target user info and create draft direct conversation
          try {
            const { data: searchData } = await api.get(`/messages/search/users?q=`);
            const targetUserData = searchData.users?.find(u => Number(u.id || u._id) === targetId);
            
            const newDirectDraft = {
              id: directId,
              _id: directId,
              conversationId: directId,
              isDirect: true,
              otherUser: targetUserData || { id: targetId, _id: targetId, name: 'User #' + targetId, role: 'creator' },
              campaign: { title: `Direct Chat: ${targetUserData?.name || 'User'}` },
              status: 'active'
            };

            setConversations(prev => [newDirectDraft, ...prev]);
            selectConversation(newDirectDraft);
            return;
          } catch (e) {
            console.error('Failed to prepare direct conversation:', e);
          }
        }
      }

      // Default: If conversations exist and none selected, auto select the first one on large screen
      if (!selectedConv && convList.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 1024) {
        selectConversation(convList[0]);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const selectConversation = async (conv) => {
    setSelectedConv(conv);
    try {
      const convId = conv.conversationId || conv._id || conv.id;
      const { data } = await api.get(`/messages/${convId}`);
      setMessages(data.messages || []);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const getOtherParty = (conv) => {
    if (!conv) return null;
    if (conv.otherUser) return conv.otherUser;

    const currentUserId = String(user?._id || user?.id);
    const creatorObj = conv.creator;
    const brandObj = conv.brand;

    const creatorId = String(creatorObj?._id || creatorObj?.id || conv.creatorId || '');
    if (currentUserId === creatorId) {
      return brandObj || { name: 'Brand Partner', role: 'brand' };
    }
    return creatorObj || brandObj || { name: 'User', role: 'creator' };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || sending) return;
    const other = getOtherParty(selectedConv);
    const receiverId = other?.id || other?._id;
    const convId = selectedConv.conversationId || selectedConv._id || selectedConv.id;

    setSending(true);
    try {
      const payload = {
        conversationId: String(convId),
        applicationId: selectedConv.isDirect ? undefined : String(convId),
        receiverId: receiverId ? Number(receiverId) : undefined,
        message: newMessage.trim(),
      };

      const { data } = await api.post('/messages', payload);
      setMessages(prev => {
        if (prev.some(m => String(m._id || m.id) === String(data.message?.id || data.message?._id))) return prev;
        return [...prev, data.message];
      });
      setNewMessage('');
      fetchConversationsQuietly();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConv) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB');
      return;
    }

    const other = getOtherParty(selectedConv);
    const receiverId = other?.id || other?._id;
    const convId = selectedConv.conversationId || selectedConv._id || selectedConv.id;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', String(convId));
    if (!selectedConv.isDirect) {
      formData.append('applicationId', String(convId));
    }
    if (receiverId) {
      formData.append('receiverId', String(receiverId));
    }
    formData.append('message', `📎 Sent an attachment: ${file.name}`);

    setSending(true);
    const toastId = toast.loading('Uploading media file...');
    try {
      const { data } = await api.post('/messages', formData);
      setMessages(prev => [...prev, data.message]);
      toast.success('File sent successfully!', { id: toastId });
      fetchConversationsQuietly();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed', { id: toastId });
    } finally {
      setSending(false);
      e.target.value = '';
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(prev => prev.filter(m => String(m._id || m.id) !== String(messageId)));
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const clearChat = async () => {
    if (!selectedConv) return;
    if (!confirm('Are you sure you want to clear all messages in this chat?')) return;
    const convId = selectedConv.conversationId || selectedConv._id || selectedConv.id;

    try {
      await api.delete(`/messages/conversation/${convId}`);
      setMessages([]);
      toast.success('Chat cleared');
      fetchConversationsQuietly();
    } catch {
      toast.error('Failed to clear chat');
    }
  };

  const isMine = (msg) => {
    const senderId = String(msg.sender?.id || msg.sender?._id || msg.senderId || msg.sender || '');
    const myId = String(user?.id || user?._id || '');
    return senderId === myId;
  };

  const getMediaUrl = (fileUrl) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    let base = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://creatorlens-hydg.onrender.com';
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      base = 'http://localhost:5000';
    }
    return `${base}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
  };

  // Search users in modal
  const handleSearchUsers = async (query) => {
    setUserSearchQuery(query);
    setSearchingUsers(true);
    try {
      const { data } = await api.get(`/messages/search/users?q=${encodeURIComponent(query)}`);
      setUserSearchResults(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const startChatWithUser = (targetUser) => {
    setShowNewChatModal(false);
    const currentUserId = Number(user?.id || user?._id);
    const targetId = Number(targetUser.id || targetUser._id);
    const directId = `direct_${Math.min(currentUserId, targetId)}_${Math.max(currentUserId, targetId)}`;

    // Check if conversation already in list
    const existing = conversations.find(c => {
      const cId = String(c._id || c.id || c.conversationId || '');
      return cId === directId;
    });

    if (existing) {
      selectConversation(existing);
    } else {
      const newConv = {
        id: directId,
        _id: directId,
        conversationId: directId,
        isDirect: true,
        otherUser: targetUser,
        campaign: { title: `Direct Chat: ${targetUser.name}` },
        status: 'active',
        updatedAt: new Date()
      };
      setConversations(prev => [newConv, ...prev]);
      selectConversation(newConv);
    }
  };

  // Filtered conversation list
  const filteredConversations = conversations.filter(c => {
    const other = getOtherParty(c);
    const otherName = (other?.brandProfile?.companyName || other?.name || '').toLowerCase();
    const campaignTitle = (c.campaign?.title || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = otherName.includes(term) || campaignTitle.includes(term);
    if (!matchesSearch) return false;

    if (activeFilter === 'deals') return !c.isDirect;
    if (activeFilter === 'direct') return !!c.isDirect;
    return true;
  });

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col lg:flex-row">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 h-[calc(100dvh-57px)] lg:h-screen flex flex-col overflow-hidden">
        <div className="flex h-full w-full">
          
          {/* 💬 Left Conversation List Panel */}
          <div className={`w-full lg:w-80 xl:w-96 glass bg-dark-900/90 border-r border-dark-600 flex flex-col flex-shrink-0 ${selectedConv ? 'hidden lg:flex' : 'flex'}`}>
            
            {/* Header with Title and Start Chat Button */}
            <div className="p-4 border-b border-dark-600 flex items-center justify-between gap-2">
              <div>
                <h2 className="font-bold text-xl text-white flex items-center gap-2">
                  <MessageSquare size={20} className="text-primary-400" /> Messages
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  {conversations.length} conversation{conversations.length === 1 ? '' : 's'}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowNewChatModal(true);
                  handleSearchUsers('');
                }}
                className="btn-primary text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 font-semibold"
                title="Start a new direct chat"
              >
                <Plus size={14} /> New Chat
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-3 border-b border-dark-600/70 space-y-2 bg-dark-800/30">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search chats or creators..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-dark-750/80 border border-dark-600 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div className="flex gap-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'deals', label: 'Deals & Campaigns' },
                  { id: 'direct', label: 'Direct Messages' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                      activeFilter === tab.id
                        ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30 font-semibold'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-dark-700/40">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <MessageSquare size={36} className="mx-auto mb-3 opacity-25 text-primary-400" />
                  <p className="text-sm font-semibold text-gray-300">No conversations found</p>
                  <p className="text-xs text-gray-500 mt-1 mb-4">
                    {searchTerm ? 'Try a different search query' : 'Start chatting directly with brands and creators'}
                  </p>
                  <button
                    onClick={() => {
                      setShowNewChatModal(true);
                      handleSearchUsers('');
                    }}
                    className="btn-secondary text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5"
                  >
                    <Plus size={13} /> Start Direct Chat
                  </button>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const other = getOtherParty(conv);
                  const isSelected = (selectedConv?._id || selectedConv?.id || selectedConv?.conversationId) === (conv._id || conv.id || conv.conversationId);
                  const otherName = other?.brandProfile?.companyName || other?.name || 'User';
                  const otherRole = other?.role || (conv.isDirect ? 'user' : 'deal');

                  return (
                    <div
                      key={conv._id || conv.id || conv.conversationId}
                      onClick={() => selectConversation(conv)}
                      className={`p-3.5 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-primary-500/15 border-l-4 border-l-primary-500' 
                          : 'hover:bg-dark-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName)}&background=22223A&color=4F63FF&size=44`}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10"
                            alt={otherName}
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-dark-900 rounded-full" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-semibold text-sm text-white truncate">{otherName}</span>
                            {conv.updatedAt && (
                              <span className="text-[10px] text-gray-500 flex-shrink-0">
                                {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-gray-400 truncate">
                            {conv.isDirect ? 'Direct Brand & Creator Chat' : (conv.campaign?.title || 'Campaign Deal')}
                          </div>

                          <div className="flex items-center gap-1.5 mt-1">
                            {conv.isDirect ? (
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-purple-500/20 text-purple-300 font-semibold uppercase">
                                Direct Chat
                              </span>
                            ) : (
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                                conv.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                conv.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                conv.status === 'shortlisted' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {conv.status || 'deal'}
                              </span>
                            )}

                            {otherRole && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase font-mono font-medium ${
                                otherRole === 'brand' ? 'bg-blue-500/15 text-blue-400' : 'bg-yellow-500/15 text-yellow-400'
                              }`}>
                                {otherRole}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 💬 Right Chat Area Panel */}
          <div className={`flex-1 flex-col h-full overflow-hidden ${!selectedConv ? 'hidden lg:flex' : 'flex'}`}>
            {selectedConv ? (
              <>
                {/* Responsive Chat Header */}
                <div className="glass bg-dark-900/95 border-b border-dark-600 px-3.5 py-2.5 sm:px-5 sm:py-3.5 flex items-center justify-between gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setSelectedConv(null)}
                      className="lg:hidden p-1.5 -ml-1 rounded-xl text-gray-300 hover:text-white hover:bg-dark-700/80 active:scale-95 transition-all flex-shrink-0"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    
                    <div className="relative flex-shrink-0">
                      <img
                        src={getOtherParty(selectedConv)?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getOtherParty(selectedConv)?.name || 'U')}&background=4F63FF&color=fff&size=40`}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-1 ring-primary-500/30"
                        alt="Participant"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-dark-900 rounded-full" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-white truncate">
                          {getOtherParty(selectedConv)?.brandProfile?.companyName || getOtherParty(selectedConv)?.name || 'User'}
                        </span>
                        
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold flex-shrink-0 ${
                          selectedConv.isDirect
                            ? 'bg-purple-500/20 text-purple-300'
                            : (selectedConv.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400')
                        }`}>
                          {selectedConv.isDirect ? 'Direct' : (selectedConv.status || 'Active')}
                        </span>
                      </div>

                      <div className="text-[11px] sm:text-xs text-gray-400 truncate flex items-center gap-1.5">
                        <span>{selectedConv.campaign?.title || 'Direct Communication Channel'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={clearChat}
                      className="px-2.5 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-all flex items-center gap-1.5 font-medium active:scale-95"
                      title="Clear chat messages"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">Clear Chat</span>
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3 sm:space-y-4 bg-dark-900/40">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 py-16 max-w-sm mx-auto">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                        <Sparkles size={26} />
                      </div>
                      <p className="text-base font-semibold text-white">Start the conversation! 👋</p>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                        Send a message to discuss campaign deliverables, rates, timelines, or send draft media proofs.
                      </p>
                    </div>
                  )}

                  {messages.map((msg, i) => {
                    const mine = isMine(msg);
                    const senderName = msg.sender?.name || (mine ? user?.name : 'Participant');
                    const senderRole = msg.sender?.role || (mine ? user?.role : '');

                    return (
                      <div key={msg.id || msg._id || i} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                        {/* Sender Label */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-gray-400">
                          <span className="font-semibold text-gray-300">{senderName}</span>
                          {senderRole && (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono tracking-wider font-semibold ${
                              senderRole === 'brand' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {senderRole}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 group max-w-[88%] sm:max-w-md">
                          {mine && (
                            <button
                              onClick={() => deleteMessage(msg.id || msg._id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1.5 bg-dark-700/60 hover:bg-dark-600 rounded-lg flex-shrink-0"
                              title="Delete message"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}

                          <div className={`w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-sm ${
                            mine
                              ? 'bg-primary-500 text-white rounded-br-sm'
                              : 'glass bg-dark-750/90 text-white rounded-bl-sm border border-dark-600'
                          }`}>
                            {msg.fileUrl && (
                              <div className="mb-2 rounded-xl overflow-hidden border border-white/10 max-w-sm">
                                {msg.fileType?.startsWith('image') ? (
                                  <img 
                                    src={getMediaUrl(msg.fileUrl)} 
                                    alt="Attachment" 
                                    className="w-full h-auto object-cover max-h-64 cursor-pointer hover:opacity-90 transition-opacity" 
                                    onClick={() => window.open(getMediaUrl(msg.fileUrl), '_blank')}
                                  />
                                ) : msg.fileType?.startsWith('video') ? (
                                  <video 
                                    src={getMediaUrl(msg.fileUrl)} 
                                    controls 
                                    className="w-full h-auto max-h-64 rounded-lg bg-black"
                                  />
                                ) : (
                                  <a 
                                    href={getMediaUrl(msg.fileUrl)} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-2 p-2.5 bg-dark-800 text-blue-400 hover:underline text-xs"
                                  >
                                    📎 Download File Attachment
                                  </a>
                                )}
                              </div>
                            )}

                            {msg.message && <p className="text-sm leading-relaxed break-words">{msg.message}</p>}

                            <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${mine ? 'text-primary-200' : 'text-gray-500'}`}>
                              <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {mine && <CheckCircle size={10} className="text-primary-200" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Composer Bar */}
                <div className="glass bg-dark-900/95 border-t border-dark-600 p-2.5 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3 max-w-4xl mx-auto">
                    <label 
                      className="p-2.5 sm:p-3 bg-dark-750 hover:bg-dark-600 border border-dark-600 hover:border-dark-500 rounded-xl cursor-pointer text-gray-300 hover:text-white transition-all flex items-center justify-center flex-shrink-0 active:scale-95" 
                      title="Attach file, photo or proof"
                    >
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,video/*,application/pdf" 
                        onChange={handleFileUpload} 
                        disabled={sending}
                      />
                      <Paperclip size={18} />
                    </label>

                    <input
                      className="input-field flex-1 py-2.5 px-3.5 sm:py-3 sm:px-4 text-sm rounded-xl"
                      placeholder="Type a message to brand or creator..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />

                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="btn-primary p-2.5 sm:px-5 sm:py-3 rounded-xl flex-shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-semibold"
                      aria-label="Send message"
                    >
                      <Send size={16} />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 p-6">
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                    <MessageSquare size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">Direct Brand & Creator Chat</h3>
                  <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                    Select an active campaign deal or start a direct conversation with any creator or brand.
                  </p>
                  <button
                    onClick={() => {
                      setShowNewChatModal(true);
                      handleSearchUsers('');
                    }}
                    className="btn-primary text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-lg"
                  >
                    <Plus size={15} /> Start New Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 🚀 Modal: Start New Chat with Creator / Brand */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass bg-dark-900 border border-dark-600 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-dark-600 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Start New Conversation</h3>
                <p className="text-xs text-gray-400">Connect with creators and brands on CreatorLens</p>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search Input */}
            <div className="p-3 border-b border-dark-600 bg-dark-800/40">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or brand..."
                  value={userSearchQuery}
                  onChange={e => handleSearchUsers(e.target.value)}
                  className="w-full bg-dark-750 border border-dark-600 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  autoFocus
                />
              </div>
            </div>

            {/* User Search Results List */}
            <div className="flex-1 overflow-y-auto p-2 divide-y divide-dark-700/40">
              {searchingUsers ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Searching directory...</p>
                </div>
              ) : userSearchResults.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <User size={32} className="mx-auto mb-2 opacity-30 text-primary-400" />
                  <p className="text-xs font-medium">No users found</p>
                </div>
              ) : (
                userSearchResults.map(targetUser => {
                  const company = targetUser.brandProfile?.companyName;
                  const name = company || targetUser.name;
                  const followers = targetUser.creatorProfile?.totalFollowers;

                  return (
                    <div
                      key={targetUser.id || targetUser._id}
                      onClick={() => startChatWithUser(targetUser)}
                      className="p-3 rounded-xl hover:bg-dark-750 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={targetUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=22223A&color=4F63FF&size=40`}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10 flex-shrink-0"
                          alt={name}
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-white truncate flex items-center gap-1.5">
                            <span>{name}</span>
                            {targetUser.isVerified && <Shield size={12} className="text-green-400 flex-shrink-0" />}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate flex items-center gap-2">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono font-semibold ${
                              targetUser.role === 'brand' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {targetUser.role}
                            </span>
                            {followers && (
                              <span>{(followers).toLocaleString()} followers</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button className="text-xs bg-primary-500/10 text-primary-400 group-hover:bg-primary-500 group-hover:text-white px-3 py-1.5 rounded-lg font-medium transition-all flex-shrink-0">
                        Chat →
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-dark-900">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
