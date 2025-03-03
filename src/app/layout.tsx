import './globals.css';
import { Inter } from 'next/font/google';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MyAE - Dein KI Assistent',
  description: 'MyAE ist ein KI-Assistent, der hilft, Inhalte zu erstellen und Schreibarbeit zu erleichtern.',
  icons: {
    icon: '/icon/myae-icon_4x4.png',
    apple: '/icon/myae-icon_4x4.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="/icon/myae-icon_4x4.png" />
        <link rel="apple-touch-icon" href="/icon/myae-icon_4x4.png" />
      </head>
      <body className={inter.className}>
        <div className="grid-overlay"></div>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
