import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';
import AppShell from './AppShell';

export const metadata: Metadata = {
  title: 'Virtual University Exam Preparation Portal',
  description: 'Online Examination and Practice Portal — MCQs, Short Questions, Long Questions & Past Papers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen font-sans antialiased bg-slate-50">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
