import axios from "axios";

const api = axios.create({
  baseURL: "https://45f9-122-56-207-79.ngrok-free.app",
});

export const getCurrentFlightData = async (body: any) => {
  const response = await api.post("/activeflights", body);
  console.log(response);
  return response.data;
};

export const chatGeoPTPromptResponse = async (body: any) => {
  const response = await api.post("/geopt/flights", body, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(response);
  return response.data;
};
