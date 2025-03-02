import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Anmelden - myÆ',
  description: 'Melde dich bei myÆ an, um deine KI-Assistenten zu nutzen.',
};

export default function LoginPage() {
  return (
    <main className="main">
      <LoginForm />
    </main>
  );
} 