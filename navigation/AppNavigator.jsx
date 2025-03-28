import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage
import { Text, View } from 'react-native'; // Para el caso de "Loading..."

import HomeScreen from '../pages/HomeScreen';
import LoginScreen from '../pages/LoginScreen';
import ProfileScreen from '../pages/ProfileScreen';
import RegisterScreen from '../pages/RegisterScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Al principio está como null para mostrar "Loading..."

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // Verifica si hay token
        if (token) {
          setIsAuthenticated(true); // El usuario está autenticado
        } else {
          setIsAuthenticated(false); // El usuario no está autenticado
        }
      } catch (error) {
        console.error('Error al verificar autenticación', error);
        setIsAuthenticated(false); // Si hay error, se asume que no está autenticado
      }
    };

    checkAuthentication(); // Llama a la función para verificar el token cuando se inicie
  }, []);

  // Mientras se verifica la autenticación, mostramos un mensaje de carga
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? 'Home' : 'Login'}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false, // Deshabilita la barra de navegación para la pantalla de Login
          }}
        />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
