import UserInfo from '@/components/auth/UserInfo';

export const metadata = {
  title: 'Mein Profil - myÆ',
  description: 'Verwalte dein Benutzerprofil bei myÆ.',
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Mein Profil</h1>
      <div className="max-w-md mx-auto">
        <UserInfo />
      </div>
    </div>
  );
} 