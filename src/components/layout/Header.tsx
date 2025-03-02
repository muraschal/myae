import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  // Wenn wir auf einer Auth-Seite sind, zeigen wir keinen Header an
  if (isAuthPage) {
    return null;
  }

  return (
    <header className="header">
      <div className="container mx-auto px-4 py-4">
        <Link href="/" className="text-xl font-bold">
          myÆ
        </Link>
      </div>
    </header>
  );
} 