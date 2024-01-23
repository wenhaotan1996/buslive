'use client';

import { Loader } from '@googlemaps/js-api-loader';
import { useEffect } from 'react';
import BusLogo from '@/public/buslogo.png';
import MyLocation from '@/public/my-location.svg';
import * as _ from 'lodash';
import { getRouteStopPrediction, getRouteVehicles } from '@/lib/routes';

type Props = {
  route: Route;
  directionId: string;
};

const BUS_UPDATE_FREQUENCY = 2000;

function invertHex(hex: string) {
  return (Number(`0x1${hex}`) ^ 0xffffff).toString(16).substr(1).toUpperCase();
}

function extractDir(dirId: string) {
  return dirId?.split('_')?.slice(0, 2)?.join('_');
}

function createCustomElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: { [name: string]: any }
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const attr in options) {
    _.set(el, attr, options[attr]);
  }
  return el;
}

function renderStopPrediction(
  stopName: string,
  directionId: string,
  predictions: Prediction[]
) {
  return `<div class='text-center space-y-2 text-lg'>
    <h3 class='font-bold'>${stopName}</h3>
    <h4>${
      predictions.length > 0
        ? `${predictions.map(({ minutes }) => minutes).join(',')} mins`
        : 'No prediction at this time'
    }</h4>
  </div>`;
}

function renderVehicleInfo(id: string) {
  return `<h3 class='font-bold text-center'>${id}</h3>`;
}

function moveMarker(
  marker: google.maps.marker.AdvancedMarkerElement,
  newCoord: { lat: number; lng: number },
  duration: number = 1000,
  steps: number = 10
) {
  if (!marker?.position) return;
  const latStart = marker.position.lat as number;
  const lngStart = marker.position.lng as number;
  const latStep = (newCoord.lat - latStart) / steps;
  const lngStep = (newCoord.lng - lngStart) / steps;

  let stepsTaken = 0;
  function move() {
    if (stepsTaken >= steps || !marker?.position) return;
    stepsTaken += 1;
    marker.position = {
      lat: latStart + latStep * stepsTaken,
      lng: lngStart + lngStep * stepsTaken,
    };
    setTimeout(move, duration / steps);
  }
  move();
}

export default function RouteMap({ route, directionId }: Props) {
  const stops = route.directions
    .filter(({ id }) => id === directionId)[0]
    .stops.map(({ lat, lon, name, id }) => ({ lat, lng: lon, name, id }));

  useEffect(() => {
    let map: google.maps.Map | null;
    let busMarkers: {
      [id: string]: google.maps.marker.AdvancedMarkerElement;
    } = {};
    let busUpdateTimeoutId: NodeJS.Timeout | null = null;
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API!,
      version: 'weekly',
    });
    let currentLocationMarker: google.maps.marker.AdvancedMarkerElement | null =
      null;
    async function initMap() {
      try {
        /* init map object */
        const { Map } = await loader.importLibrary('maps');
        const mapOptions = {
          center: {
            lat: (route.boundingBox.latMax + route.boundingBox.latMin) / 2,
            lng: (route.boundingBox.lonMax + route.boundingBox.lonMin) / 2,
          },
          zoom: 12,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID,
          streetViewControl: false,
          mapTypeControl: false,
        };
        map = new Map(document.getElementById('map')!, mapOptions);

        /* current location button */
        const locationButton = createCustomElement('img', {
          src: MyLocation.src,
          className: 'w-10 h-10 bg-white mr-[10px] p-2 cursor-pointer',
        });

        locationButton.addEventListener('click', () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position: GeolocationPosition) => {
                const pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                const locationMarker = createCustomElement('div', {
                  className: 'relative h-10 w-10',
                });
                const innerCircle = createCustomElement('div', {
                  className:
                    'absolute h-3 w-3 rounded-full bg-blue-500 opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                });
                const outerCircle = createCustomElement('div', {
                  className:
                    'absolute h-10 w-10 rounded-full bg-blue-200 animate-[location-pulse_3.5s_ease-in-out_infinite]',
                });
                locationMarker.appendChild(outerCircle);
                locationMarker.appendChild(innerCircle);

                if (!currentLocationMarker) {
                  currentLocationMarker = new AdvancedMarkerElement({
                    map,
                    position: pos,
                    content: locationMarker,
                  });
                } else {
                  currentLocationMarker.position = pos;
                }

                map?.panTo(pos);
              }
            );
          }
        });

        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
          locationButton
        );

        /* add stops marker */
        const bounds = new google.maps.LatLngBounds();
        const { AdvancedMarkerElement } = (await google.maps.importLibrary(
          'marker'
        )) as google.maps.MarkerLibrary;
        stops.forEach(({ lat, lng, name, id: stopId }) => {
          bounds.extend(new google.maps.LatLng(lat, lng));
          const infowindow = new google.maps.InfoWindow({
            content: '',
          });
          const stop = createCustomElement('div', {
            className: 'w-3 h-3 rounded-full',
            'style.backgroundColor': `#${invertHex(route.color)}`,
          });
          const marker = new AdvancedMarkerElement({
            map,
            position: { lat, lng },
            content: stop,
          });
          marker.addListener('click', async () => {
            const predictions = await getRouteStopPrediction(
              route.id,
              stopId,
              route.agency
            );
            const contentString = renderStopPrediction(
              name,
              directionId,
              predictions
            );
            infowindow.setContent(contentString);
            infowindow.open({
              anchor: marker,
              map,
            });
            google.maps.event.addListener(map!, 'click', () => {
              infowindow.close();
            });
          });
        });
        map?.fitBounds(bounds);

        /* draw route path */
        for (let i = 1; i < stops.length; i++) {
          const routePath = new google.maps.Polyline({
            path: [stops[i - 1], stops[i]],
            icons: [
              {
                icon: {
                  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  scale: 3,
                  strokeWeight: 3,
                },
                offset: '60%',
              },
            ],
            geodesic: true,
            strokeColor: `#${route.color}`,
            strokeOpacity: 1.0,
            strokeWeight: 5,
          });
          routePath.setMap(map);
        }
      } catch (error) {
        console.error(error);
      }
    }
    async function drawBus() {
      const { AdvancedMarkerElement } = (await google.maps.importLibrary(
        'marker'
      )) as google.maps.MarkerLibrary;
      const buses = await getRouteVehicles(route.id, route.agency);
      buses
        .filter(
          ({ dir, id, vehiclePosition: { pathTag } }) =>
            id &&
            (extractDir(dir?.id) === extractDir(directionId) ||
              extractDir(pathTag) === extractDir(directionId))
        )
        .forEach(({ id, lat, lon }) => {
          if (!(id in busMarkers)) {
            // const infowindow = new google.maps.InfoWindow({
            //   content: renderVehicleInfo(id),
            // });
            const busLogo = createCustomElement('img', {
              src: BusLogo.src,
              className: 'w-7 h-7 z-50',
            });
            const marker = new AdvancedMarkerElement({
              map,
              position: { lat, lng: lon },
              content: busLogo,
            });
            // marker.addListener('click', () => {
            //   infowindow.open({
            //     anchor: marker,
            //     map,
            //   });
            //   google.maps.event.addListener(map!, 'click', () => {
            //     infowindow.close();
            //   });
            // });
            busMarkers[id] = marker;
          } else if (
            lat !== busMarkers[id]?.position?.lat ||
            lon !== busMarkers[id]?.position?.lng
          ) {
            moveMarker(busMarkers[id]!, { lat, lng: lon });
          }
        });

      busUpdateTimeoutId = setTimeout(drawBus, BUS_UPDATE_FREQUENCY);
    }

    initMap();
    drawBus();

    return () => {
      if (busUpdateTimeoutId != null) clearTimeout(busUpdateTimeoutId);
    };
  }, []);
  return (
    <div className="text-black h-full w-full">
      <div id="map" className="h-full w-full"></div>
    </div>
  );
}
