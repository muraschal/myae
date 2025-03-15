import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Anmelden - myÆ Strategischer Berater',
  description: 'Melde dich bei myÆ an, um deinen strategischen KI-Berater zu nutzen und deine nächste Milliarden-Dollar-Idee zu entwickeln.',
};

export default function LoginPage() {
  return (
    <main className="main">
      <LoginForm />
    </main>
  );
} 