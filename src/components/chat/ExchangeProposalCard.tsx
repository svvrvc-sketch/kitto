'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  X,
  Check,
  QrCode,
} from 'lucide-react';
import { ExchangeProposalPayload } from '@/types/chat';

interface ExchangeProposalCardProps {
  proposal: ExchangeProposalPayload;
  messageId: string;
  senderId: string;
  senderName?: string;
  currentUserId: string;
  onAccept?: (proposalId: string) => Promise<void> | void;
  onDecline?: (proposalId: string) => Promise<void> | void;
  onOpenQRModal?: () => void;
  onOpenBookDetail?: (bookId: string) => void;
  targetOwnerId?: string;
}

export const ExchangeProposalCard: React.FC<ExchangeProposalCardProps> = ({
  proposal,
  messageId: _messageId,
  senderId,
  senderName,
  currentUserId,
  onAccept,
  onDecline,
  onOpenQRModal,
  onOpenBookDetail,
  targetOwnerId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!proposal || !proposal.offered_book || !proposal.requested_book) {
    return (
      <div className="p-3 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs text-stone-500">
        Taklif ma&#39;lumotlari mavjud emas
      </div>
    );
  }

  // Recipient check: If target_owner_id is set, match against that.
  // Otherwise, the recipient is the person who didn't send the proposal message.
  const isRecipient = proposal.target_owner_id
    ? currentUserId === proposal.target_owner_id
    : targetOwnerId
    ? currentUserId === targetOwnerId
    : currentUserId !== senderId;

  const status = proposal.status || 'pending';
  const isPending = status === 'pending';
  const isAccepted = status === 'accepted';
  const isDeclined = status === 'declined';

  const offeredCover = proposal.offered_book?.cover_url || proposal.offered_book?.coverUrl;
  const requestedCover = proposal.requested_book?.cover_url || proposal.requested_book?.coverUrl;
  const offeredTitle = proposal.offered_book?.title || 'Kitob';
  const offeredAuthor = proposal.offered_book?.author || '';
  const requestedTitle = proposal.requested_book?.title || 'Kitob';
  const requestedAuthor = proposal.requested_book?.author || '';

  const handleAcceptClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSubmitting || !onAccept) return;
    setIsSubmitting(true);
    try {
      await onAccept(proposal.proposal_id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSubmitting || !onDecline) return;
    setIsSubmitting(true);
    try {
      await onDecline(proposal.proposal_id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id={`exchange-proposal-card-${proposal.proposal_id}`}
      className="w-full max-w-sm sm:max-w-md bg-[#F8F7F4] dark:bg-zinc-900 border border-[#E5E7EB] dark:border-zinc-800 rounded-2xl p-4 shadow-tactile transition-all select-none"
    >
      {/* Card Header: Amber accent tag «ALMASHISH TAKLIFI» with book icon */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]/80 dark:border-zinc-800 gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-900 dark:text-amber-300 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase">
          <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>ALMASHISH TAKLIFI</span>
        </div>

        {/* Status indicator tag */}
        {isPending && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100/90 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <Clock className="w-3 h-3 animate-pulse" />
            <span>Kutilmoqda</span>
          </span>
        )}
        {isAccepted && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Qabul qilindi</span>
          </span>
        )}
        {isDeclined && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-200/80 text-stone-600 dark:bg-zinc-800 dark:text-zinc-400 border border-stone-300 dark:border-zinc-700">
            <X className="w-3 h-3" />
            <span>Rad etildi</span>
          </span>
        )}
      </div>

      {/* Proposer note */}
      <p className="text-xs text-stone-700 dark:text-stone-300 font-medium my-2.5">
        {senderName
          ? `${senderName} ushbu kitobni almashishni taklif qilmoqda`
          : 'Ushbu kitobni almashish taklif qilinmoqda'}
      </p>

      {/* Dual-Book Mini Cards (Side-by-Side) */}
      <div className="relative grid grid-cols-2 gap-2.5 sm:gap-3 my-3 items-stretch">
        {/* Center Separator Badge */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-50 dark:bg-zinc-850 border border-amber-300 dark:border-amber-600 shadow-md flex items-center justify-center z-10 pointer-events-none"
        >
          <ArrowLeftRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Left Card (Taklif qilingan kitob) */}
        <div
          onClick={() => proposal.offered_book?.id && onOpenBookDetail && onOpenBookDetail(proposal.offered_book.id)}
          className="bg-white dark:bg-zinc-800/90 rounded-xl p-2.5 border border-[#E5E7EB] dark:border-zinc-700/80 flex flex-col items-center text-center shadow-xs cursor-pointer group hover:border-amber-400 dark:hover:border-amber-500 transition-all"
          title="Kitob ma'lumotlarini ko'rish"
        >
          <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 dark:text-zinc-400 mb-1.5 truncate max-w-full">
            Taklif qilingan
          </span>

          <div className="w-16 h-24 rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-700/80 shrink-0 mb-2 border border-stone-200 dark:border-zinc-700 shadow-2xs group-hover:scale-105 transition-transform flex items-center justify-center">
            {offeredCover ? (
              <img
                src={offeredCover}
                alt={offeredTitle}
                className="w-16 h-24 rounded-lg object-cover"
              />
            ) : (
              <BookOpen className="w-6 h-6 text-stone-400 dark:text-zinc-500" />
            )}
          </div>

          <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate w-full group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
            {offeredTitle}
          </h4>
          <p className="text-[11px] text-charcoal-600 text-stone-600 dark:text-zinc-400 truncate w-full mt-0.5">
            {offeredAuthor}
          </p>
        </div>

        {/* Right Card (So'ralgan kitob) */}
        <div
          onClick={() => proposal.requested_book?.id && onOpenBookDetail && onOpenBookDetail(proposal.requested_book.id)}
          className="bg-white dark:bg-zinc-800/90 rounded-xl p-2.5 border border-[#E5E7EB] dark:border-zinc-700/80 flex flex-col items-center text-center shadow-xs cursor-pointer group hover:border-amber-400 dark:hover:border-amber-500 transition-all"
          title="Kitob ma'lumotlarini ko'rish"
        >
          <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 dark:text-zinc-400 mb-1.5 truncate max-w-full">
            So&#39;ralgan kitob
          </span>

          <div className="w-16 h-24 rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-700/80 shrink-0 mb-2 border border-stone-200 dark:border-zinc-700 shadow-2xs group-hover:scale-105 transition-transform flex items-center justify-center">
            {requestedCover ? (
              <img
                src={requestedCover}
                alt={requestedTitle}
                className="w-16 h-24 rounded-lg object-cover"
              />
            ) : (
              <BookOpen className="w-6 h-6 text-stone-400 dark:text-zinc-500" />
            )}
          </div>

          <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate w-full group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
            {requestedTitle}
          </h4>
          <p className="text-[11px] text-charcoal-600 text-stone-600 dark:text-zinc-400 truncate w-full mt-0.5">
            {requestedAuthor}
          </p>
        </div>
      </div>

      {/* Interactive Actions (for the Book Owner / Recipient) */}
      {isPending && isRecipient && (
        <div className="mt-3 pt-3 border-t border-[#E5E7EB]/80 dark:border-zinc-800 flex items-center justify-end gap-2 animate-in fade-in duration-200">
          <button
            id={`proposal-decline-btn-${proposal.proposal_id}`}
            type="button"
            disabled={isSubmitting}
            onClick={handleDeclineClick}
            className="bg-transparent text-charcoal-600 text-stone-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 text-xs font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Kutilmoqda...' : 'Rad etish'}
          </button>

          <button
            id={`proposal-accept-btn-${proposal.proposal_id}`}
            type="button"
            disabled={isSubmitting}
            onClick={handleAcceptClick}
            className="bg-obsidian-900 bg-[#141413] hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 px-4 py-2 rounded-xl text-xs font-medium shadow-xs transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isSubmitting ? 'Tasdiqlanmoqda...' : 'Qabul qilish'}</span>
          </button>
        </div>
      )}

      {isPending && !isRecipient && (
        <div className="mt-3 pt-2.5 border-t border-[#E5E7EB]/80 dark:border-zinc-800 text-center">
          <span className="text-[11px] text-stone-500 dark:text-zinc-400 italic">
            Kitob egasining tasdiqlashi kutilmoqda...
          </span>
        </div>
      )}

      {/* Automatically render the «QR-kod orqali topshirish» CTA button right inside the chat card */}
      {isAccepted && (
        <div className="mt-3 pt-3 border-t border-[#E5E7EB]/80 dark:border-zinc-800 space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Almashish taklifi qabul qilindi!</span>
          </div>

          {onOpenQRModal && (
            <button
              id={`exchange-qr-btn-${proposal.proposal_id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenQRModal();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4" />
              <span>QR-kod orqali topshirish</span>
            </button>
          )}
        </div>
      )}

      {isDeclined && (
        <div className="mt-2.5 pt-2 border-t border-[#E5E7EB]/80 dark:border-zinc-800 text-center">
          <span className="text-xs text-red-600 dark:text-red-400 font-medium">
            Ushbu almashish taklifi rad etilgan
          </span>
        </div>
      )}
    </div>
  );
};
