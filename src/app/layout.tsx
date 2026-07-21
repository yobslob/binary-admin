import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Binary Admin — Editor Pipeline',
  description: 'Internal dashboard for managing the Binary Growth editor pipeline, lead assignments, and outreach tracking.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
