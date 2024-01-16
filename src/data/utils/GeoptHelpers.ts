export const identifyResponseType = (response: any) => {
  console.log("Response to ID: ", response);
  if (Array.isArray(response)) {
    if (response.length === 0) {
      return "Empty Response";
    }

    // Check if the response is an array of arrays (for routesResponse)
    if (Array.isArray(response[0])) {
      return "routesResponse";
    }

    // Check if the response is an array of objects
    else if (typeof response[0] === "object" && response[0] !== null) {
      // Check for a unique property of currentFlightsResponse
      if ("aircraft_icao" in response[0]) {
        return "currentFlightsResponse";
      }
      // Check for a unique property of airportsResponse
      else if ("countryname" in response[0]) {
        return "airportsResponse";
      }
    }
  }

  return "Unknown Response Type";
};

export function parsePathData(data: any) {
  // Remove the curly braces at the start and end, and split the string into entries
  let entries = data.slice(2, -2).split('","');

  // Map each entry to an object with the specified keys
  return entries.map((entry: any) => {
    // Remove the parentheses and split the entry into values
    let [iata, lat, long, latlong] = entry.slice(1, -1).split(",");

    // Convert latitude and longitude to numbers
    lat = parseFloat(lat);
    long = parseFloat(long);

    // Return the new object
    return { iata, lat, long, latlong };
  });
}

export function calculateRadius(seats: number, R_max: number, R_min: number) {
  return R_min + ((seats - 43) * (R_max - R_min)) / (55000000 - 43);
}
