import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./apiEndpoints";
import { navigationRef } from "../App";

// Create Axios Instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Add Interceptors (Optional)
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // console.log("Final Request Headers:", config.headers);
        return config;
    },
    (error) => Promise.reject(error)
);


// Handle token expiration in response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        console.log("status?>", status);

        if (status === 401) {
            // console.warn("Unauthorized - Token expired!");

            // Clear the token from AsyncStorage
            await AsyncStorage.removeItem("accessToken");

            // Navigate to Login or Onboarding only if navigation is ready
            if (navigationRef.isReady()) {
                navigationRef.reset({
                    index: 0,
                    routes: [{ name: "Login" }],  // Change to "Onboarding" if needed
                });
            }
        }

        console.error("API Error:", error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);


// Helper Functions
const apiHelper = {
    get: async (url, params = {}, config = {}) => {
        try {
            const response = await axiosInstance.get(url, {
                params,
                headers: { ...axiosInstance.defaults.headers, ...config.headers },
                ...config,
            });
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || "An error occurred");
        }
    },

    post: async (url, data = {}, config = {}) => {
        try {
            const response = await axiosInstance.post(url, data, config);
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || "An error occurred");
        }
    },
    // Added PUT method
    put: async (url, data = {}, config = {}) => {
        try {
            // Fetch the token to attach it to the request if necessary
            const token = await AsyncStorage.getItem("accessToken");
            if (token) {
                config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
            }
            const response = await axiosInstance.put(url, data, config);

            // Ensure the response is a valid JSON object and handle non-JSON response gracefully
            let responseBody = response;

            // Handle case where the response is a string 'null'
            if (responseBody === 'null') {
                throw new Error("Received null response from server");
            }

            // If the response is not valid JSON, throw an error
            if (responseBody === null || typeof responseBody === 'string') {
                throw new Error("Received invalid response from server");
            }

            // console.log("Raw response body: ", responseBody);
            return responseBody;
        } catch (error) {
            console.error("Error in PUT request:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "An error occurred");
        }
    },


    delete: async (url, data = {}, config = {}) => {
        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (token) {
                config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
            }
            const response = await axiosInstance.delete(url, data, config);

            // Ensure response is valid
            let responseBody = response;

            if (responseBody === 'null') {
                throw new Error("Received null response from server");
            }

            if (responseBody === null || typeof responseBody === 'string') {
                throw new Error("Received invalid response from server");
            }

            return responseBody;
        } catch (error) {
            console.error("Error in DELETE request:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "An error occurred");
        }
    },



    // Adding PATCH method
    patch: async (url, data = {}, config = {}) => {
        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (token) {
                config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
            }
            const response = await axiosInstance.patch(url, data, config);

            // Ensure response is valid
            let responseBody = response;

            if (responseBody === 'null') {
                throw new Error("Received null response from server");
            }

            if (responseBody === null || typeof responseBody === 'string') {
                throw new Error("Received invalid response from server");
            }

            return responseBody;
        } catch (error) {
            console.error("Error in PATCH request:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "An error occurred");
        }
    },


};

export default apiHelper;
