'use client';

import Header from '@/components/navigation/Header';
import Footer from '@/components/navigation/Footer';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main className="main">
        {children}
      </main>
      <Footer />
    </div>
  );
} 