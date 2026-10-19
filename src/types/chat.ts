export type MessageType = 'text' | 'exchange_proposal';
export type ProposalStatus = 'pending' | 'accepted' | 'declined';

export interface BookMiniMeta {
  id: string;
  title: string;
  author: string;
  cover_url?: string;
  coverUrl?: string;
}

export interface ExchangeProposalPayload {
  proposal_id: string;
  offered_book: BookMiniMeta;
  requested_book: BookMiniMeta;
  status: ProposalStatus;
  target_owner_id?: string;
  created_at?: string;
  responded_at?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
  type?: MessageType;
  proposal?: ExchangeProposalPayload;
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
