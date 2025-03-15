import { Suspense } from 'react';
import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm';
import { Analytics } from "@vercel/analytics/react";

export default function UpdatePasswordPage() {
  return (
    <div className="container mx-auto py-12">
      <Suspense fallback={<div className="text-center">Lade...</div>}>
        <UpdatePasswordForm />
      </Suspense>
      <Analytics />
    </div>
  );
} 