'use client';

import React, { useState } from 'react';
import { Project, IntegrityCheckResult } from '@/types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertOctagon, 
  GitPullRequest, 
  Plus, 
  Trash2, 
  Key, 
  Loader2,
  Info
} from 'lucide-react';

interface GuardrailViewProps {
  project: Project;
  onUpdateProtectedFiles: (files: string[]) => void;
}

export const GuardrailView: React.FC<GuardrailViewProps> = ({
  project,
  onUpdateProtectedFiles,
}) => {
  const [prInput, setPrInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkResult, setCheckResult] = useState<IntegrityCheckResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [files, setFiles] = useState<string[]>(project.protectedFiles || []);
  const [newFile, setNewFile] = useState('');

  const handleRunCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prInput.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    setCheckResult(null);

    try {
      let prNumber: number | undefined;
      let prUrl: string | undefined;

      if (prInput.startsWith('http')) {
        prUrl = prInput.trim();
        const match = prUrl.match(/pull\/(\d+)/);
        if (match) prNumber = parseInt(match[1], 10);
      } else {
        prNumber = parseInt(prInput.trim(), 10);
        prUrl = `https://github.com/${project.githubRepo}/pull/${prNumber}`;
      }

      const res = await fetch('/api/check-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: project.githubRepo,
          prNumber,
          prUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Pemeriksaan PR gagal');
      }

      setCheckResult(data.result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat memeriksa PR.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFile = (e: React.FormEvent) => {
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

  const handleRemoveFile = (fileToRemove: string) => {
    const updated = files.filter((f) => f !== fileToRemove);
    setFiles(updated);
    onUpdateProtectedFiles(updated);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Intro Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Guardrail & Deteksi AI-Diff</h2>
        <p className="text-xs text-slate-500 mt-1">
          Mencegah siswa SMK atau junior merusak konfigurasi arsitektur karena secara tidak sengaja menerima perubahan kode otomatis dari AI.
        </p>
      </div>

      {/* PR Check Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <GitPullRequest className="w-4 h-4 text-purple-600" />
          <span>Uji Kepatuhan Pull Request (PR):</span>
        </div>

        <form onSubmit={handleRunCheck} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            required
            value={prInput}
            onChange={(e) => setPrInput(e.target.value)}
            placeholder="Masukkan nomor PR (misal: 18) atau URL PR GitHub..."
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:bg-white"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memeriksa Diff...</span>
              </>
            ) : (
              <span>Periksa PR</span>
            )}
          </button>
        </form>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}

        {/* Live Result Box */}
        {checkResult && (
          <div
            className={`rounded-xl border p-4 space-y-2 transition-all ${
              checkResult.status === 'PASSED'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : checkResult.status === 'WARNING'
                ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                : 'bg-rose-50/90 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              {checkResult.status === 'PASSED' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-800">PR Lolos Guardrail ✅</span>
                </>
              ) : checkResult.status === 'WARNING' ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-800">Peringatan: File Terproteksi Tersentuh ⚠️</span>
                </>
              ) : (
                <>
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <span className="text-rose-800">Verifikasi Gagal 🚨</span>
                </>
              )}
            </div>

            <p className="text-xs leading-relaxed">{checkResult.message}</p>

            {checkResult.violatedFiles.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold block mb-1">File Terdampak:</span>
                <div className="flex flex-wrap gap-1.5">
                  {checkResult.violatedFiles.map((file) => (
                    <span
                      key={file}
                      className="font-mono text-[11px] font-semibold bg-white border border-slate-300 text-rose-700 px-2 py-0.5 rounded"
                    >
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Protected Files Configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Daftar File yang Dilindungi (Protected Files)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            File di bawah ini tidak boleh diubah oleh anggota tim tanpa persetujuan langsung dari mentor.
          </p>
        </div>

        {/* Add File Form */}
        <form onSubmit={handleAddFile} className="flex gap-2">
          <input
            type="text"
            value={newFile}
            onChange={(e) => setNewFile(e.target.value)}
            placeholder="Tambah file (misal: docker-compose.yml atau vite.config.ts)..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:bg-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </form>

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          {files.map((file) => (
            <div
              key={file}
              className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
            >
              <span className="truncate">{file}</span>
              <button
                onClick={() => handleRemoveFile(file)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                title="Hapus proteksi"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Token Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Key className="w-4 h-4 text-slate-600" />
          <span>Koneksi GitHub Private Organization Majastic:</span>
        </div>
        <p className="leading-relaxed">
          Untuk memeriksa repositori private secara langsung tanpa batasan, pastikan kamu menambahkan <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">GITHUB_PAT</code> di file <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">.env.local</code> atau di Vercel Dashboard.
        </p>
      </div>

    </div>
  );
};
