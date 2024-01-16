export interface IGeoState {
  libreData: any;
  activeFlightData: any;
  airportData: any;
  routeData: any;
}

export const initialGeoState: IGeoState = {
  libreData: null,
  activeFlightData: null,
  airportData: null,
  routeData: null,
};
