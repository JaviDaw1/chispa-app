import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';

import AuthService from '../services/authService';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const authService = new AuthService();

  useEffect(() => {
    const loadUser = async () => {
      const userInfo = await authService.getUserInfo();
      setUser(userInfo);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await authService.logout(); // Borra token e información del usuario
    navigation.popToTop(); // Regresa a la pantalla de inicio de sesión (sin eliminar la pila)
  };

  const goToProfile = () => {
    if (user) {
      navigation.navigate('Profile', { userId: user.id }); // Pasa el userId como parámetro
    }
  };
  const goToPreferences = () => {
    if (user) {
      navigation.navigate('Preference', { userId: user.id });
    }
  };
  const goToMessages = () => {
    if (user) {
      navigation.navigate('Message', { userId: user.id });
    }
  };
  const goToMatches = () => {
    if (user) {
      navigation.navigate('Match', { userId: user.id });
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {user ? (
        <>
          <Text>Bienvenido a Chispa, {user.name}</Text>
          <Button title="Ver Perfil" onPress={goToProfile} />
          <Button title="Ver Preferencias" onPress={goToPreferences} />
          <Button title="Ver Mensajes" onPress={goToMessages} />
          <Button title="Ver Matches" onPress={goToMatches} />
        </>
      ) : (
        <Text>Cargando usuario...</Text>
      )}
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
};

export default HomeScreen;
