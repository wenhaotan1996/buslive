type RouteInfo = {
  id: string;
  title: string;
  description: string;
  color: string;
};

type RouteResponse = {
  id: string;
  color: string;
  boundingBox: {
    latMin: number;
    latMax: number;
    lonMin: number;
    lonMax: number;
  };
  title: string;
  stops: Stop[];
  directions: {
    id: string;
    shortName: string;
    name: string;
    useForUi: boolean;
    stops: string[];
  }[];
};

type Route = {
  id: string;
  agency: string;
  color: string;
  title: string;
  boundingBox: {
    latMin: number;
    latMax: number;
    lonMin: number;
    lonMax: number;
  };
  directions: {
    id: string;
    shortName: string;
    name: string;
    stops: Stop[];
  }[];
};

type Stop = {
  id: string;
  lat: number;
  lon: number;
  name: string;
  code: string;
  hidden: boolean;
};

type Vehicle = {
  id: string;
  lat: number;
  lon: number;
  dir: {
    id: string;
    dirName: string;
    dirNameShort: string;
  };
  vehiclePosition: {
    pathTag: string;
  };
};

type Agency = {
  id: string;
  name: string;
  shortName: string;
  logo: string;
};

type PredictionResponse = {
  values: {
    minutes: number;
    direction: {
      id: string;
    };
  }[];
}[];

type Prediction = {
  minutes: number;
  directionId: string;
};
