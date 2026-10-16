export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
  // Optional backward-compatibility
  conversationId?: string;
  senderName?: string;
}

export interface ChatThread {
  id: string;                      // Deterministic: `chat_${bookId}_${initiatorId}`
  bookId: string;
  bookTitle: string;
  bookCover?: string;
  bookSwapLabel: string;
  ownerId: string;
  ownerName: string;
  initiatorId: string;
  initiatorName: string;
  messages: ChatMessage[];
  updatedAt: string;

  // Backward compatibility fields for UI
  bookAuthor?: string;
  exactLocation?: string;
  swapTermText?: string;
  participantIds?: string[];
  participantNames?: Record<string, string>;
  lastMessage?: string;
  lastMessageAt?: string;
  lastSenderId?: string;
  unreadCount?: number;
}

export type ChatConversation = ChatThread;
