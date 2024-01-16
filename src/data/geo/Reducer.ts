import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialGeoState } from "./State";

const GeoSlice = createSlice({
  name: "Geo",
  initialState: initialGeoState,
  reducers: {
    loadLibreData(state, action: PayloadAction<any>) {
      state.libreData = action.payload;
    },
    loadActiveFlightData(state, action: PayloadAction<any>) {
      state.activeFlightData = action.payload;
    },
    loadAirportData(state, action: PayloadAction<any>) {
      state.airportData = action.payload;
    },
    loadRouteData(state, action: PayloadAction<any>) {
      state.routeData = action.payload;
    },
  },
});

export const GeoActions = GeoSlice.actions;

export const libreDataState = (state: any): any => state.geo.libreData;
export const activeFlightDataState = (state: any): any =>
  state.geo.activeFlightData;
export const airportDataState = (state: any): any => state.geo.airportData;
export const routeDataState = (state: any): any => state.geo.routeData;

export default GeoSlice.reducer;
