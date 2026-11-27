'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertOctagon } from 'lucide-react';
import { Task } from '@/types';

interface BlockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSubmitBlocker: (taskId: string, blockerNote: string) => void;
}

export const BlockerModal: React.FC<BlockerModalProps> = ({
  isOpen,
  onClose,
  task,
  onSubmitBlocker,
}) => {
  const [note, setNote] = useState(task?.blockerNote || '');

  useEffect(() => {
    if (isOpen && task) {
      setNote(task.blockerNote || '');
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    onSubmitBlocker(task.id, note.trim());
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-rose-950 text-sm">Laporkan Kendala (Blocker)</h2>
              <p className="text-[11px] sm:text-xs text-rose-600">Project Manager (PM) akan langsung menerima notifikasi bantuan ini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Tugas</span>
            <p className="font-semibold text-slate-800 text-xs mt-0.5">{task.title}</p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Jelaskan kendala apa yang kamu hadapi: <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Terhambat koneksi ke database Postgres lokal saat migration, atau butuh aset icon SVG dari Figma yang belum diekspor..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-xs leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              Tandai Blocked & Simpan
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
