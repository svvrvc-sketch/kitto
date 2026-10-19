/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Book } from '@/types/book';
import { ChatThread, ChatMessage } from '@/types/chat';
import { chatsService, STORAGE_CHATS_KEY } from '@/services/db';
import { useAuth } from './AuthContext';

interface ChatContextType {
  threads: ChatThread[];
  conversations: ChatThread[]; // alias for backward compatibility
  activeThreadId: string | null;
  activeConversationId: string | null; // alias
  isLoading: boolean;
  setActiveThreadId: (id: string | null) => void;
  setActiveConversationId: (id: string | null) => void; // alias
  getMessages: (threadId: string) => ChatMessage[];
  startConversation: (book: Book, initialMessage?: string) => string;
  sendMessage: (threadId: string, text: string) => void;
  markAsRead: (threadId: string) => void;
  totalUnreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load threads from chatsService (Supabase with localStorage fallback)
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    chatsService
      .getChats(user?.id)
      .then((loaded) => {
        if (isMounted) {
          setThreads(loaded);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load chats:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Real-time subscription to cloud messages & chats
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = chatsService.subscribeToChats(user.id, (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const updatedRow = payload.new;
        if (updatedRow && updatedRow.id) {
          // Re-fetch threads from service to maintain clean state
          chatsService.getChats(user.id).then((fresh) => {
            setThreads(fresh);
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  const persistThreads = (updated: ChatThread[]) => {
    setThreads(updated);
    try {
      localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist chats locally:', e);
    }
  };

  const getMessages = (threadId: string): ChatMessage[] => {
    const thread = threads.find((t) => t.id === threadId);
    return thread?.messages || [];
  };

  const markAsRead = useCallback(
    (threadId: string) => {
      setThreads((prev) => {
        let changed = false;
        let targetUpdated: ChatThread | null = null;

        const updated = prev.map((t) => {
          if (t.id === threadId) {
            const hasUnread = t.messages.some((m) => !m.isRead && m.senderId !== user?.id);
            if (hasUnread) {
              changed = true;
              targetUpdated = {
                ...t,
                messages: t.messages.map((m) =>
                  m.senderId !== user?.id ? { ...m, isRead: true } : m
                ),
              };
              return targetUpdated;
            }
          }
          return t;
        });

        if (changed && targetUpdated) {
          try {
            localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(updated));
          } catch {
            // ignore
          }
          chatsService.saveChat(targetUpdated).catch((e) => {
            console.warn('Could not sync read status to cloud:', e);
          });
          return updated;
        }
        return prev;
      });
    },
    [user?.id]
  );

  const startConversation = (book: Book, initialMessage?: string): string => {
    const currentUserId = user?.id || 'guest_user';
    const currentUserName = user?.name || 'Mehmon kitobxon';
    const ownerId = book.ownerId || `owner_${book.ownerName.toLowerCase().replace(/\s+/g, '_')}`;
    const ownerName = book.ownerName;

    // Deterministic thread key: `chat_${bookId}_${initiatorId}`
    const threadId = `chat_${book.id}_${currentUserId}`;

    const existing = threads.find((t) => t.id === threadId);

    const swapLabel =
      book.swapTerm?.durationLabel ||
      (book.swapTerm?.type === 'gift'
        ? "Bepul sovg'a"
        : book.swapTerm?.type === 'temporary'
        ? "2 haftaga o'qishga"
        : 'Doimiy almashuv');

    if (existing) {
      setActiveThreadId(existing.id);
      markAsRead(existing.id);
      if (initialMessage && initialMessage.trim()) {
        sendMessage(existing.id, initialMessage.trim());
      }
      return existing.id;
    }

    const messages: ChatMessage[] = [];
    if (initialMessage && initialMessage.trim()) {
      messages.push({
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        senderId: currentUserId,
        text: initialMessage.trim(),
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    }

    const newThread: ChatThread = {
      id: threadId,
      bookId: book.id,
      bookTitle: book.title,
      bookCover: book.coverUrl,
      bookSwapLabel: swapLabel,
      ownerId,
      ownerName,
      initiatorId: currentUserId,
      initiatorName: currentUserName,
      messages,
      updatedAt: new Date().toISOString(),
      exactLocation: book.location?.addressText || book.exactLocation || 'Toshkent',
    };

    const updated = [newThread, ...threads];
    persistThreads(updated);
    chatsService.saveChat(newThread).catch((err) => {
      console.warn('Failed to sync new chat thread to cloud:', err);
    });

    setActiveThreadId(threadId);
    return threadId;
  };

  const sendMessage = (threadId: string, text: string) => {
    if (!text.trim()) return;

    const currentUserId = user?.id || 'guest_user';

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: currentUserId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    const targetThread = threads.find((t) => t.id === threadId);
    if (!targetThread) return;

    const updatedTarget: ChatThread = {
      ...targetThread,
      messages: [...targetThread.messages, newMsg],
      updatedAt: new Date().toISOString(),
    };

    const remaining = threads.filter((t) => t.id !== threadId);
    const reordered = [updatedTarget, ...remaining];

    persistThreads(reordered);
    chatsService.saveChat(updatedTarget).catch((err) => {
      console.warn('Failed to sync message to cloud:', err);
    });
  };

  const totalUnreadCount = threads.reduce((acc, t) => {
    const unread = t.messages.filter((m) => !m.isRead && m.senderId !== user?.id).length;
    return acc + unread;
  }, 0);

  return (
    <ChatContext.Provider
      value={{
        threads,
        conversations: threads,
        activeThreadId,
        activeConversationId: activeThreadId,
        isLoading,
        setActiveThreadId,
        setActiveConversationId: setActiveThreadId,
        getMessages,
        startConversation,
        sendMessage,
        markAsRead,
        totalUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
