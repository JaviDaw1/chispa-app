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
  async getProfile(userId) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('No autenticado');
      const response = await api.get(`/profiles/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener perfil:', error.response?.data || error.message);
      throw error;
    }
  }
  // Guardar perfil en AsyncStorage
  async saveProfile(profile) {
    try {
      await AsyncStorage.setItem('profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error al guardar perfil:', error);
    }
  }
  async getStoredProfile() {
    try {
      const profile = await AsyncStorage.getItem('profile');
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error al obtener perfil almacenado:', error);
      return null;
    }
  }

  //PREFERENCIAS
  async getPreferencesByUserId(userId) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('No autenticado');

      const response = await api.get(`/preferences/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener preferencias:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateUserPreferences(userId, preferencesData) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('No autenticado');

      const response = await api.put(`/preferences/${userId}`, preferencesData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar preferencias:', error.response?.data || error.message);
      throw error;
    }
  }

  async savePreferencesToStorage(preferences) {
    try {
      await AsyncStorage.setItem('preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
    }
  }

  async getStoredPreferences() {
    try {
      const preferences = await AsyncStorage.getItem('preferences');
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('Error al obtener preferencias almacenadas:', error);
      return null;
    }
  }

  // MÉTODOS PARA MENSAJES
  async getMessage(userId) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('No autenticado');
      const response = await api.get(`/messages/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los mensajes:', error.response?.data || error.message);
      throw error;
    }
  }
  /*async getMatchDetails(matchId) {
  try {
    const token = await this.getToken();
    if (!token) throw new Error('No autenticado');
    
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalles del match:', error.response?.data || error.message);
    throw error;
  }
}

async getMessagesByMatch(matchId) {
  try {
    const token = await this.getToken();
    if (!token) throw new Error('No autenticado');
    
    const response = await api.get(`/messages/match/${matchId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener mensajes:', error.response?.data || error.message);
    throw error;
  }
} */

  async sendNewMessage(messageData) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('No autenticado');

      const response = await api.post('/messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Error al enviar mensaje:', error.response?.data || error.message);
      throw error;
    }
  }

  async markMessageAsRead(messageId) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('No autenticado');

      const response = await api.put(`/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error al marcar mensaje como leído:', error.response?.data || error.message);
      throw error;
    }
  }

  // Método para guardar mensajes en caché
  async saveMessagesToStorage(matchId, messages) {
    try {
      const allMessages = await this.getStoredMessages();
      const messagesToSave = {
        ...allMessages,
        [matchId]: messages,
      };
      await AsyncStorage.setItem('messages', JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error al guardar mensajes:', error);
    }
  }

  // Método para obtener mensajes almacenados
  async getStoredMessages() {
    try {
      const messages = await AsyncStorage.getItem('messages');
      return messages ? JSON.parse(messages) : {};
    } catch (error) {
      console.error('Error al obtener mensajes almacenados:', error);
      return {};
    }
  }

  // MATCHES
  /*async getUserMatches(userId) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('No autenticado');

      const response = await api.get(`/matches/user/${userId}`);
      return response.data.map((match) => ({
        id: match.id,
        user1_id: match.user1_id,
        user2_id: match.user2_id,
       // name: match.name,
       // lastName: match.lastName,
       // profilePhoto: match.profilePhoto,
        matchDate: match.matchDate,
        matchState: match.matchState,
       // lastMessage: match.lastMessage,
       // unreadCount: match.unreadCount || 0,
      }));
    } catch (error) {
      console.error('Error al obtener matches:', error.response?.data || error.message);
      throw error;
    }
  }*/
  async getUserMatches(userId) {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('No autenticado');

      const response = await api.get(`/matches/user/${userId}`);

      // Obtener detalles completos de cada match
      const matchesWithDetails = await Promise.all(
        response.data.map(async (match) => {
          // Obtener información del otro usuario
          const otherUserId = userId === match.user1_id ? match.user2_id : match.user1_id;
          const profileResponse = await api.get(`/profiles/user/${otherUserId}`);

          // Obtener el último mensaje
          const messagesResponse = await api.get(`/messages/match/${match.id}?limit=1`);
          const lastMessage = messagesResponse.data[0] || null;

          // Contar mensajes no leídos
          const unreadResponse = await api.get(
            `/messages/unread?matchId=${match.id}&userId=${userId}`
          );

          return {
            ...match,
            name: profileResponse.data.name,
            lastName: profileResponse.data.lastName,
            profilePhoto: profileResponse.data.profilePhoto,
            lastMessage,
            unreadCount: unreadResponse.data.count || 0,
          };
        })
      );

      return matchesWithDetails;
    } catch (error) {
      console.error('Error al obtener matches:', error.response?.data || error.message);
      throw error;
    }
  }

  async saveMatchesToStorage(matches) {
    try {
      await AsyncStorage.setItem('matches', JSON.stringify(matches));
    } catch (error) {
      console.error('Error al guardar matches:', error);
    }
  }

  async getStoredMatches() {
    try {
      const matches = await AsyncStorage.getItem('matches');
      return matches ? JSON.parse(matches) : [];
    } catch (error) {
      console.error('Error al obtener matches almacenados:', error);
      return [];
    }
  }
}
