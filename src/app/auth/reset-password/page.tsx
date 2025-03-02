import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata = {
  title: 'Passwort zurücksetzen - myÆ',
  description: 'Setze dein Passwort für myÆ zurück.',
};

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Passwort zurücksetzen</h1>
      <ResetPasswordForm />
    </div>
  );
} 