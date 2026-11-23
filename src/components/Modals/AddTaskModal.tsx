'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Code2, Palette, ListTodo, UserCheck, Target, Search, Check, ChevronDown } from 'lucide-react';
import { TaskType, HttpMethod, User, UseCase } from '@/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  useCases: UseCase[];
  initialUseCaseId?: string;
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
  useCases,
  initialUseCaseId,
  users,
  onAddTask,
}) => {
  const [selectedUseCaseId, setSelectedUseCaseId] = useState(initialUseCaseId || useCases[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('ENDPOINT');
  const [method, setMethod] = useState<HttpMethod>('POST');
  const [route, setRoute] = useState('/api/v1/');
  const [assigneeId, setAssigneeId] = useState(users[1]?.id || users[0]?.id || '');

  useEffect(() => {
    if (initialUseCaseId) {
      setSelectedUseCaseId(initialUseCaseId);
    } else if (useCases.length > 0 && !selectedUseCaseId) {
      setSelectedUseCaseId(useCases[0].id);
    }
  }, [initialUseCaseId, useCases, selectedUseCaseId]);

  // Filter Use Cases based on search query (code or title)
  const filteredUseCases = useMemo(() => {
    if (!searchQuery.trim()) return useCases;
    const query = searchQuery.toLowerCase();
    return useCases.filter(
      (uc) =>
        uc.code.toLowerCase().includes(query) ||
        uc.title.toLowerCase().includes(query) ||
        uc.businessGoal.toLowerCase().includes(query)
    );
  }, [useCases, searchQuery]);

  const selectedUseCase = useCases.find((u) => u.id === selectedUseCaseId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assigneeId || !selectedUseCaseId) return;

    onAddTask({
      useCaseId: selectedUseCaseId,
      title: title.trim(),
      type,
      endpointSpec: type === 'ENDPOINT' ? { method, route: route.trim() } : undefined,
      assigneeId,
    });

    setTitle('');
    setType('ENDPOINT');
    setRoute('/api/v1/');
    setSearchQuery('');
    setIsPickerOpen(false);
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
              <h2 className="font-bold text-slate-900 text-sm">Tambah Tugas Baru</h2>
              <p className="text-xs text-slate-500">Tentukan Use Case, spesifikasi endpoint atau halaman slicing</p>
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
          
          {/* Searchable Use Case Combobox */}
          <div>
            <label className="font-semibold text-slate-700 flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-slate-500" />
                <span>Pilih Use Case / Modul Fitur:</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                {useCases.length} use case tersedia
              </span>
            </label>

            {/* Selected Use Case Trigger Card */}
            <div
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-between transition-colors"
            >
              {selectedUseCase ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                    {selectedUseCase.code}
                  </span>
                  <span className="font-medium text-slate-800 text-xs truncate max-w-[280px]">
                    {selectedUseCase.title}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400">Pilih salah satu Use Case...</span>
              )}
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isPickerOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Search Dropdown / Picker Box */}
            {isPickerOpen && (
              <div className="mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg p-2 space-y-2 animate-in fade-in duration-150">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik kode (misal UC-01) atau judul fitur..."
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                    autoFocus
                  />
                </div>

                {/* Filtered List */}
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {filteredUseCases.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-[11px]">
                      Tidak ada Use Case yang cocok dengan pencarian
                    </div>
                  ) : (
                    filteredUseCases.map((uc) => {
                      const isSelected = uc.id === selectedUseCaseId;
                      return (
                        <div
                          key={uc.id}
                          onClick={() => {
                            setSelectedUseCaseId(uc.id);
                            setIsPickerOpen(false);
                            setSearchQuery('');
                          }}
                          className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-sky-50 text-sky-900 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                              {uc.code}
                            </span>
                            <span className="text-xs truncate max-w-[280px]">{uc.title}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Type Selector (Endpoint vs Slicing vs General) */}
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
              aria-label="Tugaskan Kepada"
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
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              Tambahkan Tugas
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
