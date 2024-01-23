'use client';

import { HeartIcon } from 'lucide-react';
import Link from 'next/link';

type Props = {
  route: RouteInfo;
  agency: string;
  isFavorite: boolean;

  onHeartClick: () => void;
};

export default function Route({
  route,
  agency,
  isFavorite,
  onHeartClick,
}: Props) {
  const { id, title } = route;
  return (
    <li
      key={id}
      className="flex dark:hover:bg-slate-900 hover:bg-slate-200 items-center">
      <Link
        className="flex-1 py-4 font-semibold text-lg"
        href={`/routes/${agency}/${id}`}>
        {title}
      </Link>
      <HeartIcon
        className="mr-4 md:mr-8 cursor-pointer"
        fill={isFavorite ? '#f87171' : 'transparent'}
        color={isFavorite ? 'transparent' : '#f87171'}
        onClick={onHeartClick}
      />
    </li>
  );
}
