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
  getAndLoadChatGeoPTResponse: async (body: any) => {
    const flightData = await chatGeoPTPromptResponse(body);
    const responseType = identifyResponseType(flightData);

    if (responseType === "currentFlightsResponse") {
      store.dispatch(GeoActions.loadActiveFlightData(flightData));
    } else if (responseType === "airportsResponse") {
      store.dispatch(GeoActions.loadAirportData(flightData));
    } else if (responseType === "routesResponse") {
      store.dispatch(GeoActions.loadRouteData(flightData));
    } else {
      console.log("Unknown Response Type");
    }
  },
};

export default Api;
