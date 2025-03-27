import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AuthService from '../services/authService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          navigation.navigate('Home');
        }
      } catch (error) {
        console.error('Error al verificar token:', error);
      }
    };
    checkToken();
  }, [navigation]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      if (!email || !password) {
        Alert.alert('Error', 'Por favor ingresa email y contraseña');
        return;
      }

      const authService = new AuthService();
      const response = await authService.login(email, password);

      if (response && response.token) {
        // Guardar token y todos los datos del usuario
        await AsyncStorage.setItem('token', response.token);
        
        // Guardar toda la información del usuario (incluyendo datos adicionales)
        if (response.user) {
          await AsyncStorage.setItem('user', JSON.stringify({
            ...response.user,
            firstName: response.user.firstName || response.user.firstname,
            lastName: response.user.lastName || response.user.lastname,
            gender: response.user.gender,
            location: response.user.location,
            bio: response.user.bio,
            interests: response.user.interests,
            role: response.user.role || response.role
          }));
        }

        Alert.alert('Inicio de sesión exitoso', 'Bienvenido');
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'No se recibieron datos válidos del servidor');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      let errorMessage = 'Credenciales incorrectas';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Button 
            title="Iniciar sesión" 
            onPress={handleLogin} 
            disabled={!email || !password}
          />
          <Button 
            title="Registrarse" 
            onPress={() => navigation.navigate('Register')} 
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
});

export default LoginScreen;