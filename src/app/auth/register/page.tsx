import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Registrieren - myÆ Strategischer Berater',
  description: 'Erstelle ein Konto bei myÆ und starte mit deinem strategischen KI-Berater, der dir hilft, die nächste Milliarden-Dollar-Idee zu entwickeln.',
};

export default function RegisterPage() {
  return (
    <main className="main">
      <RegisterForm />
    </main>
  );
} 