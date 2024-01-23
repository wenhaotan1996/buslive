'use client';
import { useEffect, useState } from 'react';
import Route from './Route';

type Props = {
  routes: RouteInfo[];
  agency: string;
};

type RouteFavorite = {
  [agency: string]: {
    [route: string]: boolean;
  };
};

export default function Routes({ routes: originalRoutes, agency }: Props) {
  const [favorite, setFavorite] = useState<RouteFavorite | null>(null);
  const [routes, setRoutes] = useState(originalRoutes);
  function changeFavorite(routeId: string, isFavorite: boolean) {
    if (favorite === null) return;
    setFavorite({
      ...favorite,
      [agency]: {
        ...favorite[agency],
        [routeId]: isFavorite,
      },
    });
  }

  function checkIsFavorite(routeId: string) {
    if (favorite === null) return false;
    return agency in favorite && favorite[agency][routeId];
  }
  useEffect(() => {
    setFavorite(JSON.parse(localStorage.getItem('favorite') ?? '{}') ?? {});
  }, []);

  useEffect(() => {
    if (favorite === null) return;
    localStorage.setItem('favorite', JSON.stringify(favorite));
    const sortedRoutes = originalRoutes
      .map((route, index) => ({
        route,
        index,
      }))
      .sort((a, b) => {
        return (
          a.index -
          (checkIsFavorite(a.route.id) ? routes.length : 0) -
          b.index +
          (checkIsFavorite(b.route.id) ? routes.length : 0)
        );
      })
      .map(({ route }) => route);
    setRoutes([...sortedRoutes]);
  }, [favorite]);

  return (
    <ul className="text-center divide-y-2 w-full pb-6">
      {routes.map((route) => (
        <Route
          route={route}
          agency={agency}
          isFavorite={checkIsFavorite(route.id)}
          onHeartClick={() => {
            changeFavorite(route.id, !checkIsFavorite(route.id));
          }}
          key={route.id}
        />
      ))}
    </ul>
  );
}
