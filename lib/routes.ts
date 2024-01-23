'use server';
const DEFAULT_AGENCY = 'sfmta-cis';

export async function getAllAgencies(): Promise<Agency[]> {
  const res = await fetch(
    `${process.env.UMOIQ_URL}/agencies?key=${process.env.UMOIQ_KEY}`,
    { next: { revalidate: 3600 } }
  );
  return await res.json();
}

export async function getAllRoutes(
  agency: string = DEFAULT_AGENCY
): Promise<RouteInfo[]> {
  const res = await fetch(
    `${process.env.UMOIQ_URL}/agencies/${agency}/routes?key=${process.env.UMOIQ_KEY}`,
    { next: { revalidate: 3600 } }
  );
  return await res.json();
}

export async function getRouteInfo(
  routeId: string,
  agency: string = DEFAULT_AGENCY
): Promise<Route> {
  const res = await fetch(
    `${process.env.UMOIQ_URL}/agencies/${agency}/routes/${routeId}?key=${process.env.UMOIQ_KEY}`,
    { next: { revalidate: 3600 } }
  );
  const route = (await res.json()) as RouteResponse;

  const stopsInfo: { [id: string]: Stop } = {};
  route.stops.forEach((stop) => {
    stopsInfo[stop.id] = stop;
  });

  return {
    agency,
    boundingBox: route.boundingBox,
    color: route.color,
    id: route.id,
    title: route.title,
    directions: route.directions
      .filter(({ useForUi }) => useForUi)
      .map(({ id, name, shortName, stops }) => ({
        id,
        name,
        shortName,
        stops: stops.map((id) => stopsInfo[id]),
      })),
  };
}

export async function getRouteVehicles(
  routeId: string,
  agency: string = DEFAULT_AGENCY
): Promise<Vehicle[]> {
  const res = await fetch(
    `${process.env.UMOIQ_URL}/agencies/${agency}/routes/${routeId}/vehicles?key=${process.env.UMOIQ_KEY}`,
    { cache: 'no-store' }
  );

  return await res.json();
}

export async function getRouteStopPrediction(
  routeId: string,
  stopId: string,
  agency: string = DEFAULT_AGENCY
): Promise<Prediction[]> {
  const res = await fetch(
    `${process.env.UMOIQ_URL}/agencies/${agency}/routes/${routeId}/stops/${stopId}/predictions?key=${process.env.UMOIQ_KEY}`,
    { cache: 'no-store' }
  );
  const data: PredictionResponse = await res.json();
  if (!data || !data.length) return [];
  return data[0].values.map(({ minutes, direction }) => ({
    minutes,
    directionId: direction.id,
  }));
}
