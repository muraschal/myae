'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MemoriesPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/login');
  }, [router]);
  
  return null;
} 