import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VU Exam Prep Portal',
  description: 'Virtual University Exam Preparation — MCQs, Short Questions, Math & More',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geist.className} bg-slate-950 text-slate-100 min-h-screen`}>
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="mx-auto max-w-6xl flex items-center gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-emerald-400 hover:text-emerald-300 transition-colors">
              <span className="text-2xl">🎓</span>
              <span>VU Prep Portal</span>
            </Link>
            <nav className="ml-auto flex items-center gap-4 text-sm text-slate-400">
              <Link href="/" className="hover:text-white transition-colors">Subjects</Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-800 text-center text-xs text-slate-600 py-4 mt-8">
          VU Exam Prep Portal — Study Smart 📚
        </footer>
      </body>
    </html>
  );
}
