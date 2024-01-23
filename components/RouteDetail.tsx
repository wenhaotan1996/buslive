'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RouteMap from './RouteMap';

type Props = {
  route: Route;
};

export default function RouteDetail({ route }: Props) {
  const { directions, agency } = route;
  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-center py-2 text-lg font-bold">{route.title}</h2>
      <Tabs
        defaultValue={directions[0].id}
        className="w-full flex-1 flex flex-col"
        dir="ltr">
        <TabsList className="py-6 font-semibold">
          {directions.map(({ id, shortName }) => (
            <TabsTrigger value={id} key={id}>
              {shortName}
            </TabsTrigger>
          ))}
        </TabsList>
        {directions.map(({ id }) => (
          <TabsContent value={id} key={id} className="flex-1 w-full mt-0">
            <RouteMap route={route} directionId={id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
