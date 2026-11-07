import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://192.168.18.9:8084/api/v1', // ← cambia por tu IP
    //baseURL: 'http://localhost:8084/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;
