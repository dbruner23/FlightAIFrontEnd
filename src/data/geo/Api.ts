import { GeoActions } from "./Reducer";
import sportsEquipmentData from "./sportsEquipment.json";
// import taxiData from './taxidata.json';
import flightData from "./flightData.json";
import store from "../../services/Store";
import {
  chatGeoPTPromptResponse,
  getCurrentFlightData,
} from "../../services/ApiHandler";
import { identifyResponseType } from "../utils/GeoptHelpers";

const Api = {
  loadLibreData: (callback?: () => void) => {
    store.dispatch(GeoActions.loadLibreData(sportsEquipmentData));

    if (callback) {
      callback();
    }
  },
  loadActiveFlightData: (callback?: () => void) => {
    store.dispatch(GeoActions.loadActiveFlightData(flightData));

    if (callback) {
      callback();
    }
  },
  getActiveFlightData: async (body: any) => {
    const flightData = await getCurrentFlightData(body);
    store.dispatch(GeoActions.loadActiveFlightData(flightData));
  },
  getAirportData: async (body: any) => {
    const airportData = await getCurrentFlightData(body);
    store.dispatch(GeoActions.loadAirportData(airportData));
  },
  setIsLoadingGeoPTResponse: (isLoading: boolean) => {
    store.dispatch(GeoActions.setIsLoadingGeoPTResponse(isLoading));
  },
  getAndLoadChatGeoPTResponse: async (body: any) => {
    Api.setIsLoadingGeoPTResponse(true);
    const geoptResponse = await chatGeoPTPromptResponse(body);

    if (geoptResponse === null) {
      Api.setIsLoadingGeoPTResponse(false);
      return;
    }

    const flightData = geoptResponse.tool_response;
    const responseType = identifyResponseType(flightData);

    if (responseType === "currentFlightsResponse") {
      store.dispatch(GeoActions.loadActiveFlightData(flightData));
    } else if (responseType === "airportsResponse") {
      store.dispatch(GeoActions.loadAirportData(flightData));
    } else if (responseType === "routeResponse") {
      store.dispatch(GeoActions.loadRouteData(flightData));
    } else if (responseType === "multistepRoutesResponse") {
      store.dispatch(GeoActions.loadMultiRouteData(flightData));
    } else {
      console.log("Unknown Response Type");
    }

    const chatResponse = geoptResponse.chat_response;
    store.dispatch(GeoActions.loadCurrentChatResponse(chatResponse));
    Api.setIsLoadingGeoPTResponse(false);
  },
};

export default Api;
