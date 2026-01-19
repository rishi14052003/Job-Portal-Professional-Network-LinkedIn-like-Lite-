import axios from 'axios';
import store from '../redux/store.js';

const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api', // Adjust baseURL as needed
    headers: {
        'Content-Type': 'application/json',
    },
});
//checking
axiosInstance.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = state.user.token; 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;