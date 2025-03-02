import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Anmelden - myÆ',
  description: 'Melde dich bei myÆ an, um deine KI-Assistenten zu nutzen.',
};

export default function LoginPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Bei myÆ anmelden</h1>
      <LoginForm />
    </div>
  );
} 