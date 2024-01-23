import RouteDetail from '@/components/RouteDetail';
import { getRouteInfo } from '@/lib/routes';

type Props = {
  params: {
    agency: string;
    routeId: string;
  };
};

export default async function RouteDetailPage({
  params: { agency, routeId },
}: Props) {
  const route = await getRouteInfo(routeId, agency);
  return <RouteDetail route={route} />;
}
