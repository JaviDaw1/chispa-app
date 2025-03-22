import axios from 'axios';

const API_URL = 'http://localhost:8080/api'; // Cambia esto por la URL de tu API

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
