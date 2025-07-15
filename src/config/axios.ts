import axios from "axios";

// Axios configuration
const axiosInstance = axios.create({
  baseURL: "http://localhost:8081/restaurant/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
