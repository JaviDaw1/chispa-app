import AsyncStorage from '@react-native-async-storage/async-storage'; // Para almacenar el token
import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';

import AuthService from '../services/authService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const authService = new AuthService();
      const response = await authService.login(email, password);

      // Verificar si el backend devuelve un token
      if (response && response.token) {
        // Almacenar el token en AsyncStorage para usarlo en futuras peticiones
        await AsyncStorage.setItem('token', response.token);
        // Almacenar el rol del usuario si lo necesitas
        await AsyncStorage.setItem('role', response.role);

        Alert.alert('Inicio de sesión exitoso', 'Bienvenido');
        navigation.navigate('Home'); // Navegar a la pantalla principal
      } else {
        Alert.alert('Error', 'No se recibió un token');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert('Error', 'Credenciales incorrectas');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 10,
          paddingLeft: 8,
        }}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 10,
          paddingLeft: 8,
        }}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Iniciar sesión" onPress={handleLogin} />
      <Button title="Registrarse" onPress={() => navigation.navigate('Register')} />
    </View>
  );
};

export default LoginScreen;
