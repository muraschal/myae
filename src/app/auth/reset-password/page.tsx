import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: 'Passwort zurücksetzen - myÆ',
  description: 'Setze dein Passwort für myÆ zurück.',
};

export default function ResetPasswordPage() {
  return (
    <main className="main">
      <ResetPasswordForm />
      <Analytics />
    </main>
  );
} 