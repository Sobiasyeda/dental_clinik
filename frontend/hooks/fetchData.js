// import { getAuthToken } from "../utils/event-utils.js";
export async function fetchData(endpoint, method = "GET", body = null) {
  // const token = getAuthToken();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  if (body) {
    config.body = JSON.stringify(body);
  }
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, config);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
