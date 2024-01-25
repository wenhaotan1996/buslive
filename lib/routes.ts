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

  const filteredDirections = route.directions
    .filter(({ useForUi }) => useForUi)
    .map((direction) => {
      const [, dir, varient] = direction.id.split('_');
      return {
        ...direction,
        dir,
        varient,
      };
    });

  const varients: { [key: string]: string[] } = {};
  const highestVarients: { [key: string]: string } = {};

  filteredDirections.forEach(({ dir, varient }) => {
    if (!(dir in varients)) varients[dir] = [];
    varients[dir].push(varient);
  });

  Object.keys(varients).forEach((key) => {
    varients[key].sort();
    highestVarients[key] = varients[key][varients[key].length - 1];
  });

  return {
    agency,
    boundingBox: route.boundingBox,
    color: route.color,
    id: route.id,
    title: route.title,
    directions: filteredDirections
      .filter(({ dir, varient }) => varient === highestVarients[dir])
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
