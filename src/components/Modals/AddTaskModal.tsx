'use client';

import React, { useState } from 'react';
import { X, Code2, Palette, ListTodo, UserCheck } from 'lucide-react';
import { TaskType, HttpMethod, User } from '@/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  useCaseId: string;
  users: User[];
  onAddTask: (taskData: {
    useCaseId: string;
    title: string;
    type: TaskType;
    endpointSpec?: { method: HttpMethod; route: string };
    assigneeId: string;
  }) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  useCaseId,
  users,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('ENDPOINT');
  const [method, setMethod] = useState<HttpMethod>('POST');
  const [route, setRoute] = useState('/api/v1/');
  const [assigneeId, setAssigneeId] = useState(users[1]?.id || users[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assigneeId) return;

    onAddTask({
      useCaseId,
      title: title.trim(),
      type,
      endpointSpec: type === 'ENDPOINT' ? { method, route: route.trim() } : undefined,
      assigneeId,
    });

    setTitle('');
    setType('ENDPOINT');
    setRoute('/api/v1/');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Tambah Tugas Teknis</h2>
              <p className="text-xs text-slate-500">Tentukan spesifikasi endpoint atau halaman slicing</p>
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
          
          {/* Type Selector (Tiga Pilar: Endpoint vs Slicing vs General) */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">Tipe Tugas:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('ENDPOINT')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'ENDPOINT'
                    ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-sky-600" />
                <span>BE / Endpoint</span>
              </button>

              <button
                type="button"
                onClick={() => setType('UI_SLICING')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'UI_SLICING'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span>UI Slicing</span>
              </button>

              <button
                type="button"
                onClick={() => setType('GENERAL')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'GENERAL'
                    ? 'bg-slate-100 border-slate-400 text-slate-900 ring-2 ring-slate-400/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5 text-slate-500" />
                <span>Umum</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Judul Tugas <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'ENDPOINT'
                  ? 'Contoh: Endpoint Registrasi & Validasi Schema'
                  : type === 'UI_SLICING'
                  ? 'Contoh: Slicing Halaman Dashboard + State Error'
                  : 'Contoh: Setup docker database lokal'
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-xs"
            />
          </div>

          {/* Endpoint Specification (If type === 'ENDPOINT') */}
          {type === 'ENDPOINT' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <label className="font-semibold text-slate-700 block text-[11px]">
                Spesifikasi Kontrak API (Method & Route):
              </label>
              <div className="flex gap-2">
                <select
                  aria-label="Pilih HTTP Method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs text-slate-800"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input
                  type="text"
                  required
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="/api/v1/auth/register"
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* Assignee Selector */}
          <div>
            <label className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Tugaskan Kepada (Assignee):</span>
            </label>
            <select
              aria-label="Tugaskan Kepada (Assignee)"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-xs bg-white font-medium"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.avatar} {u.name} — {u.tag || u.role}
                </option>
              ))}
            </select>
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
              Tambahkan Tugas
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
