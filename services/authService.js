import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './Api';


export default class AuthService {
  constructor() {
    this.url = '/auth'; // Endpoint base para autenticación
  }

  // Iniciar sesión
  async login(email, password) {
    try {
      // Validación básica de los campos antes de enviar la solicitud
      if (!email || !password) {
        throw new Error('Correo electrónico y contraseña son requeridos');
      }

      const response = await api.post(`${this.url}/login`, { email, password });

      if (response.status === 200) {
        const { token, user } = response.data;

        // Almacenar el token y el usuario en AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        return response.data;
      }

      throw new Error('Respuesta inesperada del servidor');
    } catch (error) {
      console.error('Error en login:', error.response?.data || error.message);
      throw error; // Se lanza el error para que el componente que llama pueda manejarlo
    }
  }

  // Registrar usuario
  async signup(signupData) {
    try {
      // Validación de los datos antes de enviarlos
      if (!signupData.email || !signupData.password) {
        throw new Error('Correo electrónico y contraseña son requeridos');
      }

      const response = await api.post(`${this.url}/signup`, signupData);
      return response.data;
    } catch (error) {
      console.error('Error en registro:', error.response?.data || error.message);
      throw error; // Se lanza el error para manejarlo en el componente
    }
  }

  // Cerrar sesión
  async logout() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  // Obtener token
  async getToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error al obtener el token:', error);
      return null;
    }
  }

  // Obtener información del usuario autenticado
   async getUserInfo() {
    try {
      // eslint-disable-next-line no-undef
      const userInfo = await AsyncStorage.getItem('user');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      return null;
    }
  }
}
