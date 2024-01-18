import React, { useEffect, useMemo, useRef, useState } from "react";
import { IconLayer, ScatterplotLayer, LineLayer } from "@deck.gl/layers/typed";
import { GreatCircleLayer } from "@deck.gl/geo-layers/typed";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Map, MapRef, NavigationControl, Popup } from "react-map-gl";
import { useSelector } from "react-redux";
import DeckGlOverlay from "./DeckGlOverlay";
import { MapStyle } from "./MapStyle";
import GeoApi from "../../data/geo/Api";
import {
  activeFlightDataState,
  airportDataState,
  multiRouteDataState,
  routeDataState,
} from "../../data/geo/Reducer";
import LocalAirportIcon from "@mui/icons-material/LocalAirport";
import { Flight } from "../../data/geo/Interfaces";
import mapboxgl from "mapbox-gl";
import {
  calculateAirportBounds,
  calculateRadius,
  parsePathData,
} from "../../data/utils/GeoptHelpers";
import * as d3 from "d3";
import { clear } from "console";

const DeckFlights = () => {
  const mapRef = useRef<MapRef>(null);

  const initialViewState = {
    latitude: -40.9006,
    longitude: 174.886,
    zoom: 5,
    pitch: 0,
  };

  const airportScale = d3.scaleLinear().domain([43, 55000000]).range([5, 25]);
  const rawActiveFlightData = useSelector(activeFlightDataState);
  const [activeFlightData, setActiveFlightData] = useState<Array<any> | null>(
    null
  );
  const rawAirportData = useSelector(airportDataState);
  const [airportData, setAirportData] = useState<Array<any> | null>(null);
  console.log(airportData);
  const rawRouteData = useSelector(routeDataState);
  const [routeData, setRouteData] = useState<Array<any> | null>(null);
  const rawMultiRouteData = useSelector(multiRouteDataState);
  const [multiRouteData, setMultiRouteData] = useState<Array<any> | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<any | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  const clearMap = () => {
    setActiveFlightData(null);
    setAirportData(null);
    setRouteData(null);
    setMultiRouteData(null);
  };

  useEffect(() => {
    clearMap();
    if (!rawActiveFlightData) {
      // GeoApi.loadDeckData(() => {
      // })
      console.log("No active flight data");
    } else {
      const mappedData = rawActiveFlightData.map((d: any) => {
        return {
          ...d,
          coordinates: [d.lng, d.lat],
        };
      });
      setActiveFlightData(mappedData);
    }
  }, [rawActiveFlightData]);

  useEffect(() => {
    clearMap();
    if (!rawAirportData) {
      console.log("No airport data");
      // GeoApi.getAirportData();
    } else {
      const mappedData = rawAirportData.map((d: any) => {
        return {
          ...d,
          coordinates: [parseFloat(d.templong), parseFloat(d.templat)],
        };
      });
      setAirportData(mappedData);
    }
  }, [rawAirportData]);

  useEffect(() => {
    clearMap();
    if (!rawRouteData) {
      console.log("No route data");
      // GeoApi.getRouteData();
    } else {
      const airportsOnRoutes: any[] = [];
      const mappedData = rawRouteData.map((route: any) => {
        airportsOnRoutes.push(
          {
            orig: route.source_airport,
            name: route.source_airport_name,
            templat: parseFloat(route.source_airport_latitude),
            templong: parseFloat(route.source_airport_longitude),
            coordinates: [
              parseFloat(route.source_airport_longitude),
              parseFloat(route.source_airport_latitude),
            ],
            totalseats: route.source_airport_total_seats,
          },
          {
            orig: route.destination_airport,
            name: route.destination_airport_name,
            templat: parseFloat(route.destination_airport_latitude),
            templong: parseFloat(route.destination_airport_longitude),
            coordinates: [
              parseFloat(route.destination_airport_longitude),
              parseFloat(route.destination_airport_latitude),
            ],
            totalseats: route.destination_airport_total_seats,
          }
        );

        const connection = {
          source: [
            parseFloat(route.source_airport_longitude),
            parseFloat(route.source_airport_latitude),
          ],
          target: [
            parseFloat(route.destination_airport_longitude),
            parseFloat(route.destination_airport_latitude),
          ],
        };

        return {
          ...route,
          connection: connection,
        };
      });

      setAirportData(airportsOnRoutes);
      setRouteData(mappedData);
      // const routeConnections = [
      //   {
      //     source: [
      //       parseFloat(route1.source_airport_longitude),
      //       parseFloat(route1.source_airport_latitude),
      //     ],
      //     target: [
      //       parseFloat(route1.destination_airport_longitude),
      //       parseFloat(route1.destination_airport_latitude),
      //     ],
      //   },
      // ];
      // setRouteData(routeConnection);
    }
  }, [rawRouteData]);

  useEffect(() => {
    clearMap();
    if (!rawMultiRouteData) {
      console.log("No route data");
      // GeoApi.getRouteData();
    } else {
      const airportsOnRoutes: any[] = [];
      const mappedData = rawMultiRouteData.map((routesGroup: any) => {
        const mappedRoutesGroup = routesGroup.map((route: any) => {
          const path = parsePathData(route.path);
          const connections = [];
          for (let i = 0; i < path.length - 1; i++) {
            connections.push({
              source: [path[i].long, path[i].lat],
              target: [path[i + 1].long, path[i + 1].lat],
            });
          }

          for (let i = 0; i < path.length; i++) {
            airportsOnRoutes.push({
              orig: path[i].iata,
              name: "",
              templat: path[i].lat,
              templong: path[i].long,
              coordinates: [path[i].long, path[i].lat],
              totalseats: "",
            });
          }

          return {
            ...route,
            path: path,
            connections: connections,
          };
        });
        return mappedRoutesGroup;
      });
      setMultiRouteData(mappedData);
      setAirportData(airportsOnRoutes);
    }
  }, [rawMultiRouteData]);

  useEffect(() => {
    if (airportData) {
      const bounds = calculateAirportBounds(airportData);
      mapRef.current?.fitBounds(
        new mapboxgl.LngLatBounds(bounds[0], bounds[1]),
        {
          padding: 20,
        }
      );
    }
  }, [airportData]);

  useEffect(() => {
    if (activeFlightData) {
      const bounds = calculateAirportBounds(activeFlightData);
      mapRef.current?.fitBounds(
        new mapboxgl.LngLatBounds(bounds[0], bounds[1]),
        {
          padding: 20,
        }
      );
    }
  }, [activeFlightData]);

  const activeFlightsLayer = useMemo(() => {
    if (!activeFlightData) {
      return null;
    }

    return new IconLayer({
      id: "icon-layer",
      data: activeFlightData,
      pickable: true,
      iconAtlas:
        "https://geoaibucket.s3.ap-southeast-2.amazonaws.com/airplaneIcon2.png",
      iconMapping: {
        marker: {
          x: 0,
          y: 0,
          width: 128,
          height: 123,
          anchorY: 128,
          mask: true,
        },
      },
      sizeScale: 25,
      getPosition: (d) => {
        return d.coordinates;
      },
      getIcon: (d) => "marker",
      getAngle: (d) => 0 - 70 - d.dir, // Rotate the icon based on the d.dir attribute
      onClick: (event) => {
        setSelectedFlight(event.object);
      },
    });
  }, [activeFlightData]);

  const airportLayer = useMemo(() => {
    if (!airportData) {
      return null;
    }

    return new ScatterplotLayer({
      id: "airport-layer",
      data: airportData,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 5,
      radiusMaxPixels: 25,
      lineWidthMinPixels: 1,
      getPosition: (d) => d.coordinates,
      getRadius: (d) => airportScale(parseFloat(d.totalseats)),
      getFillColor: [255, 140, 0],
      getLineColor: [0, 0, 0],
      onClick: (event) => {
        setSelectedAirport(event.object);
      },
    });
  }, [airportData]);

  const routeLayer = useMemo(() => {
    if (!routeData) {
      return null;
    }

    return new GreatCircleLayer({
      id: "route-layer",
      data: routeData,
      pickable: true,
      getWidth: 2,
      getSourcePosition: (d) => d.connection.source,
      getTargetPosition: (d) => d.connection.target,
      getColor: [12, 0, 139],
    });
  }, [routeData]);

  let multiRouteLayers: any = [];
  if (multiRouteData) {
    multiRouteLayers = multiRouteData[0].map((route: any, index: number) => {
      console.log(route);
      return new GreatCircleLayer({
        id: `route-layer-${index}`,
        data: route.connections,
        pickable: true,
        getWidth: 2,
        getSourcePosition: (d) => d.source,
        getTargetPosition: (d) => d.target,
        getColor: [12, 0, 139],
      });
    });
  }

  const renderAirportPopup = () => {
    if (!selectedAirport) {
      return null;
    }

    return (
      <Popup
        latitude={selectedAirport.templat}
        longitude={selectedAirport.templong}
        closeButton={true}
        closeOnClick={false}
        onClose={() => setSelectedAirport(null)}
        anchor="bottom"
        style={{ zIndex: 1000 }}
      >
        <h3>{selectedAirport.orig}</h3>
        <div>{selectedAirport.name}</div>
        {selectedAirport.totalseats.length > 0 && (
          <div>Total capacity: {selectedAirport.totalseats}</div>
        )}
      </Popup>
    );
  };

  const renderFlightPopup = () => {
    if (!selectedFlight) {
      return null;
    }

    return (
      <Popup
        latitude={selectedFlight.lat}
        longitude={selectedFlight.lng}
        closeButton={true}
        closeOnClick={false}
        onClose={() => setSelectedFlight(null)}
        anchor="bottom"
        style={{ zIndex: 1000 }}
      >
        <h3>
          {selectedFlight.airline_iata} {selectedFlight.flight_number}
        </h3>
        <div>Status: {selectedFlight.status}</div>
        <div>Altitude: {selectedFlight.alt}</div>
        <div>Speed: {selectedFlight.speed}</div>
        <div>Aircraft: {selectedFlight.aircraft_icao}</div>
      </Popup>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexGrow: 1,
      }}
    >
      <Map
        mapStyle={MapStyle}
        ref={mapRef}
        mapboxAccessToken="pk.eyJ1IjoiZGJydW5lcjIzIiwiYSI6ImNsYXI3c2IxcTFpMG0zd21xZThhNGtlMGsifQ.DZCj-DgPgGM-2sVemYGSnw"
        initialViewState={initialViewState}
        // viewState={viewState}
      >
        <NavigationControl position="bottom-right" showZoom visualizePitch />

        {(activeFlightData || airportData || multiRouteData) && (
          <DeckGlOverlay
            layers={[
              activeFlightsLayer,
              airportLayer,
              routeLayer,
              ...multiRouteLayers,
            ]}
          />
        )}
        {renderAirportPopup()}
        {renderFlightPopup()}
      </Map>
    </div>
  );
};

export default DeckFlights;
