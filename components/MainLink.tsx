'use client';

import { AgencyContext } from '@/context/AgencyContext';
import Link from 'next/link';
import { useContext } from 'react';

type Props = {
  id: string;
  title: string;
};

export default function MainLink({ id, title }: Props) {
  const { agency } = useContext(AgencyContext);
  return (
    <Link
      className="w-full h-full py-4 font-semibold text-lg"
      href={`/route/${agency}/${id}`}>
      {title}
    </Link>
  );
}
