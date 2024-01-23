'use client';

import { AgencyContext } from '@/context/AgencyContext';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';

export default function Home() {
  const { agency } = useContext(AgencyContext);
  const router = useRouter();
  useEffect(() => {
    if (agency) router.push(`/routes/${agency}`);
  }, [agency]);
  return (
    <main className="flex flex-1 flex-col items-center justify-between relative">
      <Loader2 className="absolute top-1/2 animate-spin" />
    </main>
  );
}
