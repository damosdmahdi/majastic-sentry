'use client';

import React, { useState } from 'react';
import { X, Sparkles, Target, Palette } from 'lucide-react';

interface AddUseCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string;
  onAddUseCase: (useCaseData: {
    milestoneId: string;
    code: string;
    title: string;
    businessGoal: string;
    figmaUrl?: string;
  }) => void;
}

export const AddUseCaseModal: React.FC<AddUseCaseModalProps> = ({
  isOpen,
  onClose,
  milestoneId,
  onAddUseCase,
}) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [businessGoal, setBusinessGoal] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !businessGoal.trim()) return;

    onAddUseCase({
      milestoneId,
      code: code.trim(),
      title: title.trim(),
      businessGoal: businessGoal.trim(),
      figmaUrl: figmaUrl.trim() || undefined,
    });

    setCode('');
    setTitle('');
    setBusinessGoal('');
    setFigmaUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Tambah Use Case Baru</h2>
              <p className="text-xs text-slate-500">Penyelarasan kebutuhan bisnis, UI, dan modul koding</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kode Use Case:</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Auto (e.g. UC-03)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-mono text-xs"
              />
            </div>

            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Judul Use Case / Fitur <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Manajemen Pengumuman & Berkas"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <span>Target & Kebutuhan Bisnis <span className="text-rose-500">*</span>:</span>
            </label>
            <textarea
              required
              rows={3}
              value={businessGoal}
              onChange={(e) => setBusinessGoal(e.target.value)}
              placeholder="Jelaskan kenapa fitur ini dibuat agar junior developer paham nilai bisnisnya (misal: Siswa dapat mengunggah berkas sertifikat PKL secara mandiri)..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              <span>Link Frame Figma (Opsional dari UI):</span>
            </label>
            <input
              type="url"
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              placeholder="https://www.figma.com/file/..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-xs font-mono"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              Simpan Use Case
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
