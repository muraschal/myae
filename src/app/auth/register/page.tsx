import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Registrieren - myÆ',
  description: 'Erstelle ein Konto bei myÆ, um deine KI-Assistenten zu nutzen.',
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Konto erstellen</h1>
      <RegisterForm />
    </div>
  );
} 