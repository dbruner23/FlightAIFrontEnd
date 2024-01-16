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
  routeDataState,
} from "../../data/geo/Reducer";
import LocalAirportIcon from "@mui/icons-material/LocalAirport";
import { Flight } from "../../data/geo/Interfaces";
import mapboxgl from "mapbox-gl";
import { calculateRadius, parsePathData } from "../../data/utils/GeoptHelpers";
import * as d3 from "d3";

const DeckFlights = () => {
  const mapRef = useRef<MapRef>(null);

  const initialViewState = {
    latitude: 31.7619,
    longitude: -106.485,
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
  const rawRouteData = useSelector(routeDataState);
  const [routeData, setRouteData] = useState<Array<any> | null>(null);
  console.log(routeData);
  const [selectedAirport, setSelectedAirport] = useState<any | null>(null);

  useEffect(() => {
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

    if (!rawRouteData) {
      console.log("No route data");
      // GeoApi.getRouteData();
    } else {
      const airportsOnRoutes: any[] = [];
      const mappedData = rawRouteData.map((routesGroup: any) => {
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
      setRouteData(mappedData);
      setAirportData(airportsOnRoutes);
    }
  }, [rawActiveFlightData, rawAirportData, rawRouteData]);

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

  let routeLayers: any = [];
  if (routeData) {
    routeLayers = routeData[0].map((route: any, index: number) => {
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

  const renderPopup = () => {
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
      >
        <NavigationControl position="bottom-right" showZoom visualizePitch />

        {(activeFlightData || airportData || routeData) && (
          <DeckGlOverlay
            layers={[activeFlightsLayer, airportLayer, ...routeLayers]}
          />
        )}
        {renderPopup()}
      </Map>
    </div>
  );
};

export default DeckFlights;
