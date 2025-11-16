
import axios from "axios";

const instance = axios.create({
  //baseURL: "https://localhost:7059",
  baseURL: "https://localhost:7059",

 
  
});
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  
  
  if (token) {
    
    config.headers.Authorization = `Bearer ${token}`;
    
  }
  return config;
});

export default instance;
