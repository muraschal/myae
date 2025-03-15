import { Suspense } from 'react';
import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm';
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: 'Passwort aktualisieren - myÆ',
  description: 'Setze dein Passwort für myÆ zurück und sichere deinen Account.',
};

export default function UpdatePasswordPage() {
  return (
    <main className="main">
      <Suspense fallback={<div className="text-center">Lade...</div>}>
        <UpdatePasswordForm />
      </Suspense>
      <Analytics />
    </main>
  );
} 