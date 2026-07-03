"use client";

import React, { useState, useEffect, useRef } from "react";
import { sendMessage, markMessagesAsRead } from "@/app/actions/messages";

type User = { id: string; name: string; image: string | null; role: string };
type Message = { id: string; senderId: string; receiverId: string; content: string; createdAt: string; readAt: string | null };

export default function MessagesClient({ 
  currentUserId, 
  users, 
  initialMessages 
}: { 
  currentUserId: string; 
  users: User[]; 
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChatUserId]);

  // Mark as read when opening a chat
  useEffect(() => {
    if (activeChatUserId) {
      markMessagesAsRead(activeChatUserId);
      setMessages(prev => prev.map(m => 
        (m.senderId === activeChatUserId && m.receiverId === currentUserId) ? { ...m, readAt: new Date().toISOString() } : m
      ));
    }
  }, [activeChatUserId, currentUserId]);

  const activeUser = users.find(u => u.id === activeChatUserId);
  const activeMessages = messages.filter(m => 
    (m.senderId === currentUserId && m.receiverId === activeChatUserId) ||
    (m.receiverId === currentUserId && m.senderId === activeChatUserId)
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftMessage.trim() || !activeChatUserId) return;
    
    setIsSending(true);
    try {
      await sendMessage(activeChatUserId, draftMessage);
      // Optimistic update
      setMessages([...messages, {
        id: `temp_${Date.now()}`,
        senderId: currentUserId,
        receiverId: activeChatUserId,
        content: draftMessage,
        createdAt: new Date().toISOString(),
        readAt: null
      }]);
      setDraftMessage("");
    } catch (err: any) {
      alert(err.message);
    }
    setIsSending(false);
  };

  // Unread counts
  const unreadCounts = users.reduce((acc, u) => {
    acc[u.id] = messages.filter(m => m.senderId === u.id && m.receiverId === currentUserId && !m.readAt).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-[calc(100vh-8rem)] flex overflow-hidden glass-panel rounded-3xl border border-foreground/10 shadow-2xl animate-slide-up">
      {/* Sidebar: Contact List */}
      <div className={`w-full sm:w-80 border-r border-foreground/10 flex flex-col ${activeChatUserId ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-6 border-b border-foreground/10">
          <h2 className="text-xl font-bold font-heading">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto thin-scrollbar p-3 space-y-1">
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => setActiveChatUserId(u.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${activeChatUserId === u.id ? 'bg-teal-500/10 border border-teal-500/20' : 'hover:bg-foreground/5 border border-transparent'}`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm overflow-hidden">
                  {u.image ? <img src={u.image} alt={u.name} className="w-full h-full object-cover" /> : u.name.substring(0, 2).toUpperCase()}
                </div>
                {(unreadCounts[u.id] ?? 0) > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white dark:border-slate-900">
                    {unreadCounts[u.id]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`truncate text-sm ${(unreadCounts[u.id] ?? 0) > 0 ? 'font-bold' : 'font-semibold'}`}>{u.name}</h3>
                <p className="text-xs text-foreground/50 capitalize truncate">{u.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-black/5 dark:bg-white/5 ${!activeChatUserId ? 'hidden sm:flex items-center justify-center' : 'flex'}`}>
        {!activeChatUserId ? (
          <div className="text-center p-8 opacity-50">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <p>Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 sm:p-6 border-b border-foreground/10 flex items-center gap-4 bg-background/50 backdrop-blur-md z-10">
              <button 
                onClick={() => setActiveChatUserId(null)}
                className="sm:hidden p-2 -ml-2 rounded-xl hover:bg-foreground/10 text-foreground/70"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                {activeUser?.image ? <img src={activeUser.image} alt={activeUser.name} className="w-full h-full object-cover" /> : activeUser?.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{activeUser?.name}</h3>
                <p className="text-xs text-foreground/50 capitalize">{activeUser?.role}</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {activeMessages.length === 0 ? (
                <div className="text-center text-foreground/50 text-sm mt-10">No messages yet. Say hello!</div>
              ) : (
                activeMessages.map((m, idx) => {
                  const isMine = m.senderId === currentUserId;
                  const prevMsg = activeMessages[idx-1];
                  const showTime = idx === 0 || (prevMsg && new Date(m.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 5 * 60000);
                  return (
                    <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      {showTime && (
                        <div className="text-[10px] font-bold text-foreground/40 mb-2 mt-2 uppercase tracking-widest">
                          {new Date(m.createdAt).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${isMine ? 'bg-teal-500 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-foreground/10 text-foreground rounded-tl-sm'}`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                      </div>
                      {isMine && m.readAt && (
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 mt-1 font-semibold flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          Read
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 sm:p-6 border-t border-foreground/10 bg-background/50 backdrop-blur-md">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  className="flex-1 bg-background border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={isSending || !draftMessage.trim()}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
