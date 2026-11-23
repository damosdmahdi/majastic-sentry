import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg mb-4">
        M
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-xs text-slate-500 mb-6 text-center max-w-sm">
        Halaman yang kamu cari tidak tersedia di Majastic Sentry.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
      >
        Kembali ke Papan Tugas
      </Link>
    </div>
  );
}
