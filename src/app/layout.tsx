import './globals.css';
import { Inter } from 'next/font/google';
import LayoutWrapper from '@/components/layout/LayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MyAE - Dein KI Assistent',
  description: 'MyAE ist ein KI-Assistent, der hilft, Inhalte zu erstellen und Schreibarbeit zu erleichtern.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <div className="grid-overlay"></div>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
