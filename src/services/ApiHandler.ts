import axios from "axios";

const username = process.env.REACT_APP_USERNAME;
const password = localStorage.getItem("userPassword");
console.log(password);
const encodedCredentials = btoa(`${username}:${password}`);

const api = axios.create({
  baseURL: "https://flightai.onrender.com",
  // baseURL: "http://localhost:4000",
});

export const authenticate = async (password: string) => {
  try {
    const response = await api.post("/auth", { username, password });
    return response;
  } catch (error: any) {
    console.error("Authentication failed:", error);
    window.alert("Invalid password");
  }
};

export const getCurrentFlightData = async (body: any) => {
  const response = await api.post("/activeflights", body);
  return response.data;
};

export const chatGeoPTPromptResponse = async (body: any) => {
  try {
    const response = await api.post("/geopt/flights", body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${encodedCredentials}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error:", error);
    window.alert(error.response.data);
    return null;
  }
};
