'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { INITIAL_USERS } from '@/lib/initial-data';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('majastic123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      // Successful login -> Redirect to Home
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat login');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click login helper
  const handleQuickLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword('majastic123');
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, password: 'majastic123' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login cepat gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 selection:bg-slate-900 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Brand Icon & Heading */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
            M
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-slate-900">
          Majastic Sentry
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Masuk ke Control Center & Guardrail Tim Developer
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 sm:px-10 shadow-xl border border-slate-200/80 rounded-2xl space-y-6">
          
          {/* Form Login */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            
            {/* Email Field */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Email Tim:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@majastic.internal"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Password:</label>
                <span className="text-[10px] text-slate-400">Default: majastic123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold rounded-xl text-xs transition-all shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-semibold">
              <span className="bg-white px-2 text-slate-400">Pilih Cepat Akun Tim</span>
            </div>
          </div>

          {/* Quick Team Login Cards */}
          <div className="space-y-1.5">
            {INITIAL_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickLogin(user.email)}
                disabled={isLoading}
                className="w-full p-2 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0">{user.avatar}</span>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {user.tag || user.role} • {user.email}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg group-hover:bg-sky-100 shrink-0">
                  Masuk &rarr;
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          Internal Control Center • Majastic Developer Team
        </p>
      </div>
    </div>
  );
}
