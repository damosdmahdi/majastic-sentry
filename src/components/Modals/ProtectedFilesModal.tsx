'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, Plus, Trash2, Key, Info, Check } from 'lucide-react';
import { Project } from '@/types';

interface ProtectedFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateProtectedFiles: (files: string[]) => void;
}

export const ProtectedFilesModal: React.FC<ProtectedFilesModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProtectedFiles,
}) => {
  const [files, setFiles] = useState<string[]>(project.protectedFiles || []);
  const [newFile, setNewFile] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile.trim()) return;
    const clean = newFile.trim();
    if (!files.includes(clean)) {
      const updated = [...files, clean];
      setFiles(updated);
      onUpdateProtectedFiles(updated);
    }
    setNewFile('');
  };

  const handleRemove = (fileToRemove: string) => {
    const updated = files.filter((f) => f !== fileToRemove);
    setFiles(updated);
    onUpdateProtectedFiles(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Protected Files & Guardrail Config</h2>
              <p className="text-xs text-slate-500">Mencegah file arsitektur terubah tanpa sengaja oleh AI atau anak SMK</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Explanation Alert */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Jika developer/anak SMK memasukkan PR yang menyentuh file di bawah ini, sistem otomatis memberi label peringatan <strong>AI-Diff Alert ⚠️</strong> sebelum kamu melakukan review kode.
            </p>
          </div>

          {/* Form Add File */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newFile}
              onChange={(e) => setNewFile(e.target.value)}
              placeholder="Contoh: docker-compose.yml atau .env.example"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-xs font-mono"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </form>

          {/* Protected Files List */}
          <div>
            <label className="font-semibold text-slate-700 block mb-2">
              Daftar File Dilindungi Saat Ini ({files.length}):
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {files.map((file) => (
                <div
                  key={file}
                  className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    {file}
                  </span>
                  <button
                    onClick={() => handleRemove(file)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                    title="Hapus proteksi file ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub PAT instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Key className="w-3.5 h-3.5 text-slate-600" />
              <span>Koneksi ke GitHub Org Private Majastic:</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Untuk menghubungkan guardrail langsung ke repo private Majastic secara live, tambahkan environment variable di Vercel atau file <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">.env.local</code>:
            </p>
            <div className="bg-slate-900 text-slate-200 font-mono text-[11px] p-2 rounded-lg">
              GITHUB_PAT=ghp_your_private_token_here
            </div>
            <p className="text-[10px] text-slate-500 italic">
              *Jika token belum diisi, sistem berjalan dalam mode simulasi validasi cerdas.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
