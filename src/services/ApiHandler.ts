import axios from "axios";

const api = axios.create({
  baseURL: "https://b68b-115-189-96-191.ngrok-free.app",
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
