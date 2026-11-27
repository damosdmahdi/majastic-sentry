'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  FileText, 
  FolderDown, 
  Bot 
} from 'lucide-react';

interface ObsidianViewProps {
  markdownContent: string;
}

export const ObsidianView: React.FC<ObsidianViewProps> = ({
  markdownContent,
}) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const aiPrompt = `Bertindaklah sebagai Senior Project Manager (PM) & Engineering Lead.
Analisis data rekap sprint mingguan di atas:
1. Berikan evaluasi objektif untuk masing-masing developer (Junior Fullstack, Anak SMK, dan UI/FE).
2. Temukan akar masalah dari blocker dan tugas yang menggantung (stale tasks).
3. Buatkan rencana bimbingan teknis (coaching topics) 1-on-1 untuk anak SMK dan junior agar mereka tidak mengulangi kesalahan AI diff pada file arsitektur.
4. Susun prioritas backlog dan target sprint untuk minggu berikutnya.`;

  const handleCopyMd = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(aiPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownload = () => {
    window.location.href = '/api/export-obsidian';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Jembatan Pengetahuan ke Obsidian</h2>
          <p className="text-xs text-slate-500 mt-1">
            Ekspor rekapitulasi progres tim, blocker, dan kepatuhan kode ke format Markdown untuk dianalisis oleh AI di Second Brain lokalmu.
          </p>
        </div>

        {/* Primary Action: Download Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyMd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            {copiedMd ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Markdown</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-purple-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Download File .md</span>
          </button>
        </div>
      </div>

      {/* Recommended Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Step 1: Taruh di Obsidian */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
            <FolderDown className="w-4 h-4 text-purple-600" />
            <span>1. Simpan di Vault Obsidian:</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Letakkan file <code className="bg-slate-100 text-purple-700 font-mono px-1.5 py-0.5 rounded text-[11px]">.md</code> hasil unduhan di dalam folder mingguan vault-mu, misalnya:
          </p>
          <div className="font-mono text-xs bg-slate-50 border border-slate-200 text-slate-700 p-2.5 rounded-xl">
            📁 My-Second-Brain/03_Weekly-Reviews/
          </div>
        </div>

        {/* Step 2: Gunakan Prompt AI */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <Bot className="w-4 h-4 text-sky-600" />
              <span>2. Prompt untuk Asisten AI:</span>
            </div>
            <button
              onClick={handleCopyPrompt}
              className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
            >
              {copiedPrompt ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedPrompt ? 'Tersalin' : 'Salin Prompt'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Buka file tersebut bersama asisten AI (seperti Antigravity di Obsidian) untuk menghasilkan bahan 1-on-1 coaching dengan anak SMK.
          </p>
        </div>

      </div>

      {/* Code Preview */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>majastic-review-weekly.md (Preview)</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">YAML + Markdown</span>
        </div>
        <div className="p-6 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-[500px] overflow-y-auto">
          <pre className="whitespace-pre-wrap">{markdownContent}</pre>
        </div>
      </div>

    </div>
  );
};
