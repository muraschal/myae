import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Registrieren - myÆ',
  description: 'Erstelle ein Konto bei myÆ und starte mit deinen KI-Assistenten.',
};

export default function RegisterPage() {
  return (
    <main className="main">
      <RegisterForm />
    </main>
  );
} 