'use client';

import React, { useState } from 'react';
import { X, GitPullRequest, ShieldCheck, ShieldAlert, AlertOctagon, Loader2, ExternalLink } from 'lucide-react';
import { Task, IntegrityCheckResult } from '@/types';

interface CheckPrModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onPrChecked: (taskId: string, prUrl: string, prNumber: number, result: IntegrityCheckResult) => void;
}

export const CheckPrModal: React.FC<CheckPrModalProps> = ({
  isOpen,
  onClose,
  task,
  onPrChecked,
}) => {
  const [prInput, setPrInput] = useState(task?.githubPrUrl || (task?.prNumber ? String(task.prNumber) : ''));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<IntegrityCheckResult | null>(task?.integrityCheck || null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !task) return null;

  const handleRunCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prInput.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      let prNumber: number | undefined;
      let prUrl: string | undefined;

      if (prInput.startsWith('http')) {
        prUrl = prInput.trim();
        const match = prUrl.match(/pull\/(\d+)/);
        if (match) prNumber = parseInt(match[1], 10);
      } else {
        prNumber = parseInt(prInput.trim(), 10);
        prUrl = `https://github.com/majastic/core-app/pull/${prNumber}`;
      }

      const res = await fetch('/api/check-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          prNumber,
          prUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Pemeriksaan PR gagal');
      }

      setResult(data.result);
      if (prNumber && prUrl) {
        onPrChecked(task.id, prUrl, prNumber, data.result);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat memeriksa PR.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Guardrail & Integrity Checker</h2>
              <p className="text-xs text-slate-500">Inspeksi diff Pull Request GitHub terhadap file terproteksi</p>
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
        <div className="p-6 space-y-4 text-xs">
          
          {/* Target Task Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Tugas Terkait</span>
            <p className="font-semibold text-slate-800 text-xs mt-0.5">{task.title}</p>
          </div>

          {/* Form Check */}
          <form onSubmit={handleRunCheck} className="space-y-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Nomor PR atau URL Pull Request GitHub:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={prInput}
                  onChange={(e) => setPrInput(e.target.value)}
                  placeholder="Contoh: 18 atau https://github.com/majastic/core-app/pull/18"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-xs font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold rounded-xl transition-all shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Memeriksa...</span>
                    </>
                  ) : (
                    <span>Cek Diff</span>
                  )}
                </button>
              </div>
            </div>
          </form>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs">
              {errorMessage}
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div
              className={`rounded-xl border p-4 space-y-2.5 transition-all ${
                result.status === 'PASSED'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : result.status === 'WARNING'
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                  : 'bg-rose-50/90 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                {result.status === 'PASSED' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-800">Verifikasi Berhasil (Lolos Guardrail)</span>
                  </>
                ) : result.status === 'WARNING' ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-800">Peringatan Guardrail (AI-Diff Terdeteksi)</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                    <span className="text-rose-800">Gagal Verifikasi</span>
                  </>
                )}
              </div>

              <p className="text-xs leading-relaxed">{result.message}</p>

              {result.violatedFiles.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-semibold block mb-1">File Terlarang/Arsitektur Terdampak:</span>
                  <div className="flex flex-wrap gap-1">
                    {result.violatedFiles.map((f) => (
                      <span key={f} className="font-mono bg-white/80 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-semibold text-rose-700">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[10px] text-slate-500 pt-1">
                Diverifikasi pada: {new Date(result.checkedAt).toLocaleTimeString('id-ID')}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
