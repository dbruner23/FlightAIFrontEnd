export interface IGeoState {
  libreData: any;
  activeFlightData: any;
  airportData: any;
  routeData: any;
  multiRouteData: any;
  isLoadingGeoPTResponse: boolean;
  currentChatResponse: string | null;
}

export const initialGeoState: IGeoState = {
  libreData: null,
  activeFlightData: null,
  airportData: null,
  routeData: null,
  multiRouteData: null,
  isLoadingGeoPTResponse: false,
  currentChatResponse: null,
};
