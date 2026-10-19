export type ExchangeTransactionStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'completed'
  | 'cancelled';

export interface ExchangeTransaction {
  id: string;
  initiator_book_id: string;
  target_book_id: string;
  owner_id: string;
  borrower_id: string;
  status: ExchangeTransactionStatus;
  created_at: string;
  updated_at?: string;
  // Backward & UI metadata
  initiator_book_title?: string;
  target_book_title?: string;
}
