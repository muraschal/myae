import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} myÆ. Alle Rechte vorbehalten.</p>
      </div>
    </footer>
  );
} 