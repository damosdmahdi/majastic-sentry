import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Majastic Sentry | Task & PM Control Center',
  description: 'Platform manajemen tugas & guardrail arsitektur untuk tim developer dan siswa SMK Majastic, terhubung langsung ke Obsidian.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
