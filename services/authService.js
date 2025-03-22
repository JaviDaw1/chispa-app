import AsyncStorage from '@react-native-async-storage/async-storage';

import api from './Api';

export default class AuthService {
  constructor() {
    this.url = '/auth'; // Endpoint base para autenticación
  }

  // Iniciar sesión
  async login(email, password) {
    try {
      const response = await api.post(`${this.url}/login`, { email, password });
      if (response.status === 200) {
        const { token, user } = response.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        return response.data;
      }
    } catch (error) {
      console.error('Error en login:', error.response?.data || error.message);
      throw error;
    }
  }

  // Registrar usuario
  async signup(signupData) {
    try {
      const response = await api.post(`${this.url}/signup`, signupData);
      return response.data;
    } catch (error) {
      console.error('Error en registro:', error.response?.data || error.message);
      throw error;
    }
  }

  // Cerrar sesión
  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  }

  // Obtener token
  async getToken() {
    return await AsyncStorage.getItem('token');
  }

  // Obtener información del usuario autenticado
  async getUserInfo() {
    const userInfo = await AsyncStorage.getItem('user');
    return userInfo ? JSON.parse(userInfo) : null;
  }
}
