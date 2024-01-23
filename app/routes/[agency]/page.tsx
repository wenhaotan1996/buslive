import Routes from '@/components/Routes';
import { getAllRoutes } from '@/lib/routes';

type Props = {
  params: {
    agency: string;
  };
};

export default async function RoutesPage({ params: { agency } }: Props) {
  const routes = await getAllRoutes(agency);
  return (
    <main>
      <Routes routes={routes} agency={agency} />
    </main>
  );
}
