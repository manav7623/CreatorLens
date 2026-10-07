'use client';
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { io } from 'socket.io-client';
import { Send, MessageSquare, Trash2, ArrowLeft, Paperclip } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const { user, isInitialized } = useSelector(state => state.auth);
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchConversations();

    // Initialize socket
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://creatorlens-hydg.onrender.com');
    socketInstance.emit('join', String(user?._id || user?.id));
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, isInitialized, router]);

  useEffect(() => {
    if (!socket) return;
    socket.on('receive_message', (msg) => {
      const convId = msg.conversationId || (msg.application?._id || msg.application?.id || msg.application);
      const selId = selectedConv?._id || selectedConv?.id;
      if (selectedConv && String(convId) === String(selId)) {
        setMessages(prev => [...prev, msg]);
      }
      fetchConversations();
    });

    socket.on('messages_cleared', (data) => {
      const selId = selectedConv?._id || selectedConv?.id;
      if (selectedConv && String(data.applicationId) === String(selId)) {
        setMessages([]);
        toast('Chat cleared by other party', { icon: '🧹' });
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('messages_cleared');
    };
  }, [socket, selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data.conversations || []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectConversation = async (app) => {
    setSelectedConv(app);
    try {
      const appId = app._id || app.id;
      const { data } = await api.get(`/messages/${appId}`);
      setMessages(data.messages || []);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || sending) return;
    const appId = selectedConv._id || selectedConv.id;
    const other = getOtherParty(selectedConv);
    const receiverId = other?._id || other?.id;

    setSending(true);
    try {
      const { data } = await api.post('/messages', {
        applicationId: appId,
        receiverId: receiverId,
        message: newMessage.trim(),
      });
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
    } catch (err) {
      toast.error('Failed to send message');
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

    const appId = selectedConv._id || selectedConv.id;
    const other = getOtherParty(selectedConv);
    const receiverId = other?._id || other?.id;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationId', String(appId));
    formData.append('receiverId', String(receiverId));
    formData.append('message', `📎 Sent a file: ${file.name}`);

    setSending(true);
    const toastId = toast.loading('Uploading media proof...');
    try {
      const { data } = await api.post('/messages', formData);
      setMessages(prev => [...prev, data.message]);
      toast.success('File uploaded!', { id: toastId });
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
      toast.error('Failed to delete');
    }
  };

  const clearChat = async () => {
    if (!selectedConv) return;
    if (!confirm('Are you sure you want to delete all messages in this conversation?')) return;
    const appId = selectedConv._id || selectedConv.id;

    try {
      await api.delete(`/messages/conversation/${appId}`);
      setMessages([]);
      toast.success('Chat cleared');
    } catch {
      toast.error('Failed to clear chat');
    }
  };

  const isMine = (msg) => {
    const senderId = msg.sender?._id || msg.sender?.id || msg.senderId || msg.sender;
    const myId = user?._id || user?.id;
    return String(senderId) === String(myId);
  };

  const getMediaUrl = (fileUrl) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    const base = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://creatorlens-hydg.onrender.com';
    return `${base}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
  };

  const getOtherParty = (app) => {
    if (!app) return null;
    const currentUserId = user?._id || user?.id;
    const creatorId = app.creator?._id || app.creator?.id || app.creatorId || app.creator;
    if (String(currentUserId) === String(creatorId)) {
      return app.brand;
    }
    return app.creator;
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-64 h-[calc(100dvh-57px)] lg:h-screen flex flex-col overflow-hidden">
        <div className="flex h-full w-full">
          {/* Conversation List */}
          <div className={`w-full lg:w-80 glass border-r border-dark-600 overflow-y-auto flex-shrink-0 ${selectedConv ? 'hidden lg:block' : 'block'}`}>
            <div className="p-4 sm:p-6 border-b border-dark-600">
              <h2 className="font-bold text-xl">Messages</h2>
              <p className="text-gray-400 text-sm">{conversations.length} conversation{conversations.length === 1 ? '' : 's'}</p>
            </div>

            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs text-gray-500 mt-1">Apply to campaigns to start chatting</p>
              </div>
            ) : conversations.map(app => {
              const other = getOtherParty(app);
              const isSelected = (selectedConv?._id || selectedConv?.id) === (app._id || app.id);
              return (
                <div
                  key={app._id || app.id}
                  onClick={() => selectConversation(app)}
                  className={`p-3.5 sm:p-4 border-b border-dark-600 cursor-pointer transition-all ${
                    isSelected ? 'bg-primary-500/15 border-l-4 border-l-primary-500' : 'hover:bg-dark-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=22223A&color=4F63FF&size=40`}
                      className="w-10 h-10 rounded-xl flex-shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{other?.name}</div>
                      <div className="text-xs text-gray-400 truncate">{app.campaign?.title || 'Campaign'}</div>
                      <span className={`text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full font-mono ${
                        app.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                        app.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>{app.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex-col h-full overflow-hidden ${!selectedConv ? 'hidden lg:flex' : 'flex'}`}>
            {selectedConv ? (
              <>
                {/* 📱💻 Optimized Responsive Chat Header */}
                <div className="glass border-b border-dark-600 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setSelectedConv(null)}
                      className="lg:hidden p-1.5 -ml-1 rounded-xl text-gray-300 hover:text-white hover:bg-dark-700/80 active:scale-95 transition-all flex-shrink-0"
                      aria-label="Back to conversations list"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    
                    <div className="relative flex-shrink-0">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getOtherParty(selectedConv)?.name || 'U')}&background=4F63FF&color=fff&size=40`}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-1 ring-white/10"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-dark-900 rounded-full" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm sm:text-base text-white truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs">
                          {getOtherParty(selectedConv)?.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium flex-shrink-0 ${
                          selectedConv.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {selectedConv.status}
                        </span>
                      </div>
                      <div className="text-[11px] sm:text-xs text-gray-400 truncate">
                        {selectedConv.campaign?.title || 'Direct Message'}
                      </div>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={clearChat}
                      className="p-2 sm:px-3 sm:py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-all flex items-center gap-1 font-medium active:scale-95"
                      title="Clear entire conversation"
                    >
                      <Trash2 size={15} />
                      <span className="hidden sm:inline">Clear Chat</span>
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 py-16">
                      <MessageSquare size={36} className="mx-auto mb-3 opacity-30 text-primary-400" />
                      <p className="text-sm font-medium">No messages yet. Say hello! 👋</p>
                      <p className="text-xs text-gray-500 mt-1">Discuss deliverables, deadlines and requirements</p>
                    </div>
                  )}
                  {messages.map((msg, i) => {
                    const mine = isMine(msg);
                    const senderName = msg.sender?.name || (mine ? user?.name : 'Other User');
                    const senderRole = msg.sender?.role || (mine ? user?.role : '');

                    return (
                      <div key={i} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                        {/* Sender details */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-gray-400">
                          <span className="font-semibold text-gray-300">{senderName}</span>
                          {senderRole && (
                            <span className={`px-1.5 py-0.2 rounded-md text-[9px] uppercase font-mono tracking-wider font-semibold ${
                              senderRole === 'brand' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {senderRole}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 group max-w-[85%] sm:max-w-md">
                          {mine && (
                            <button
                              onClick={() => deleteMessage(msg._id || msg.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1.5 bg-dark-700/50 hover:bg-dark-600 rounded-lg flex-shrink-0"
                              title="Delete message"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                          <div className={`w-full px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl ${
                            mine
                              ? 'bg-primary-500 text-white rounded-br-sm'
                              : 'glass text-white rounded-bl-sm'
                          }`}>
                            {msg.fileUrl && (
                              <div className="mb-2 rounded-lg overflow-hidden border border-white/10 max-w-sm">
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
                                    className="w-full h-auto max-h-64"
                                  />
                                ) : (
                                  <a 
                                    href={getMediaUrl(msg.fileUrl)} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-2 p-2 bg-dark-800/40 text-blue-400 hover:underline text-xs"
                                  >
                                    📎 Download Attachment
                                  </a>
                                )}
                              </div>
                            )}
                            {msg.message && <p className="text-sm leading-relaxed break-words">{msg.message}</p>}
                            <p className={`text-[10px] mt-1 ${mine ? 'text-primary-200' : 'text-gray-500'}`}>
                              {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* 📱💻 Bottom Input Composer */}
                <div className="glass border-t border-dark-600 p-2.5 sm:p-4 bg-dark-900/90 backdrop-blur-md">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <label className="p-2.5 sm:p-3 bg-dark-700/80 hover:bg-dark-600 border border-dark-600 hover:border-dark-500 rounded-xl cursor-pointer text-gray-300 hover:text-white transition-all flex items-center justify-center flex-shrink-0 active:scale-95" title="Attach file or screenshot">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,video/*" 
                        onChange={handleFileUpload} 
                        disabled={sending}
                      />
                      <Paperclip size={18} />
                    </label>

                    <input
                      className="input-field flex-1 py-2.5 px-3.5 sm:py-3 sm:px-4 text-sm rounded-xl"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="btn-primary p-2.5 sm:px-4 sm:py-3 rounded-xl flex-shrink-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label="Send message"
                    >
                      <Send size={17} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 p-6">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-20 text-primary-400" />
                  <p className="text-lg font-semibold text-gray-300">Select a conversation</p>
                  <p className="text-sm text-gray-500 mt-1">Your deals and active chats will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
