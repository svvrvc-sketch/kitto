'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { booksService } from '@/services/db';
import { Book } from '@/types/book';
import { UserProfile } from '@/types/auth';
import { Logo } from '@/components/Logo';
import {
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Search,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'books' | 'users'>('books');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedBooks = await booksService.getBooks();
      setBooks(fetchedBooks);

      if (user) {
        setUsers([user]);
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Haqiqatdan ham bu kitobni tizimdan oʻchirmoqchimisiz?")) return;
    try {
      await booksService.deleteBook(bookId);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      showToast("Kitob tizimdan o'chirildi", 'info');
    } catch {
      showToast("Kitobni o'chirishda xatolik", 'error');
    }
  };

  const handleToggleBookStatus = async (book: Book) => {
    const nextStatus = book.status === 'active' ? 'swapped' : 'active';
    try {
      await booksService.updateBookStatus(book.id, nextStatus);
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, status: nextStatus, isCompleted: nextStatus === 'swapped' } : b))
      );
      showToast(`Kitob holati o'zgartirildi: ${nextStatus}`, 'success');
    } catch {
      showToast("Holatni yangilashda xatolik", 'error');
    }
  };

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.ownerName.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q)
    );
  }, [books, searchQuery]);

  // RBAC Client Guard
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8F7F4] dark:bg-zinc-950 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
          Kirish taqiqlangan (403 Forbidden)
        </h1>
        <p className="text-sm text-stone-600 dark:text-zinc-400 max-w-md mt-2 mb-6">
          Ushbu sahifaga faqat administratorlar kirishi mumkin. Sizning hisobingizda administrator huquqi mavjud emas.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#141413] hover:bg-stone-800 text-[#F8F7F4] dark:bg-stone-200 dark:text-stone-900 text-xs font-semibold shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bosh sahifaga qaytish</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-zinc-950 text-stone-900 dark:text-stone-100">
      {/* Admin Header */}
      <header className="sticky top-0 z-20 editorial-glass border-b border-stone-200/80 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="cursor-pointer">
              <Logo showTagline={false} />
            </Link>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold tracking-wider uppercase">
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 dark:text-zinc-400 hidden sm:inline">
              Admin: <strong className="text-stone-900 dark:text-stone-100">{user.name}</strong>
            </span>
            <Link
              href="/"
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-stone-200 dark:border-zinc-800 text-xs font-medium hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Saytga oʻtish</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400 mb-1">
              <span className="text-xs font-medium">Jami kitoblar</span>
              <BookOpen className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-serif">{books.length}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400 mb-1">
              <span className="text-xs font-medium">Faol eʼlonlar</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
              {books.filter((b) => b.status === 'active').length}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400 mb-1">
              <span className="text-xs font-medium">Almashilgan</span>
              <RefreshCw className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold font-serif">
              {books.filter((b) => b.status === 'swapped' || b.isCompleted).length}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 dark:text-zinc-400 mb-1">
              <span className="text-xs font-medium">RBAC Holati</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              Himoyalangan (Admin)
            </div>
          </div>
        </div>

        {/* Tab & Search controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('books')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'books'
                  ? 'bg-[#141413] text-[#F8F7F4] dark:bg-stone-200 dark:text-stone-900'
                  : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-800'
              }`}
            >
              Kitoblar boshqaruvi ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-[#141413] text-[#F8F7F4] dark:bg-stone-200 dark:text-stone-900'
                  : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-800'
              }`}
            >
              Foydalanuvchilar
            </button>
          </div>

          {activeTab === 'books' && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kitob yoki muallif qidirish..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#141413] dark:focus:ring-stone-400"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Books Table */}
        {activeTab === 'books' && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100/70 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Kitob</th>
                    <th className="py-3 px-4">Kategoriya</th>
                    <th className="py-3 px-4">Egasi</th>
                    <th className="py-3 px-4">Shahar</th>
                    <th className="py-3 px-4">Holat</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        Yuklanmoqda...
                      </td>
                    </tr>
                  ) : filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        Kitoblar topilmadi
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-850/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-stone-900 dark:text-stone-100 font-serif">
                            {book.title}
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-zinc-400">{book.author}</div>
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-zinc-400">{book.category}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-stone-800 dark:text-stone-200">{book.ownerName}</div>
                          <div className="text-[10px] text-stone-400">{book.ownerContact}</div>
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-zinc-400">{book.city}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              book.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : book.status === 'temporarily_given'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                                : 'bg-stone-200 text-stone-700 dark:bg-zinc-800 dark:text-stone-300'
                            }`}
                          >
                            {book.status === 'active'
                              ? 'Faol'
                              : book.status === 'temporarily_given'
                              ? 'Oʻqishga berilgan'
                              : 'Almashilgan'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleBookStatus(book)}
                              className="p-1.5 rounded-lg border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-600 dark:text-zinc-300 transition-colors"
                              title="Holatni almashtirish"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id)}
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 transition-colors"
                              title="Oʻchirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Users Table */}
        {activeTab === 'users' && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 shadow-sm p-6">
            <h3 className="font-serif font-bold text-lg mb-2">Foydalanuvchilar va Rollar (RBAC)</h3>
            <p className="text-xs text-stone-500 dark:text-zinc-400 mb-4">
              Supabase profiles jadvalidagi <code className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800">role</code> ustuni orqali admin ruxsatlari boshqariladi.
            </p>
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-850">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#141413] text-[#F8F7F4] flex items-center justify-center font-bold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-xs">{u.name}</div>
                      <div className="text-[11px] text-stone-500 dark:text-zinc-400">{u.contact}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                      {u.role || 'user'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
