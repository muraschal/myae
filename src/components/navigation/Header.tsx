'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="header">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-neon-blue transition-colors">
          myÆ
        </Link>
      </div>
    </header>
  );
} 