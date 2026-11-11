import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';
import AppShell from './AppShell';

export const metadata: Metadata = {
  title: 'Virtual University Exam Preparation Portal — Official Pattern Simulations',
  description: 'Comprehensive VU online exam simulation & preparation platform. Featuring verified past papers, lecture-by-lecture quizzes, timed Midterm & Finalterm exams with subjective rich-text editor and bilingual Urdu explanations.',
  keywords: ['Virtual University', 'VU Exam', 'VU Past Papers', 'CS403', 'CS101', 'STA301', 'CS504', 'MGT501', 'MTH202', 'VU Quiz', 'Midterm Exam'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen font-sans antialiased bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
