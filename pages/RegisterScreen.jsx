import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';

import AuthService from '../services/authService'; // Asegúrate de que esté correctamente importado

const RegisterScreen = ({ navigation }) => {
  const [firstname, setFirstname] = useState(''); // Campo para el primer nombre
  const [lastname, setLastname] = useState(''); // Campo para el apellido
  const [username, setUsername] = useState(''); // Campo para el nombre de usuario
  const [email, setEmail] = useState(''); // Campo para el correo electrónico
  const [password, setPassword] = useState(''); // Campo para la contraseña

  const handleRegister = async () => {
    try {
      const authService = new AuthService();

      // Enviar todos los datos necesarios al backend (también el UserRole, por defecto 'CLIENT')
      const signupData = {
        firstname,
        lastname,
        username,
        email,
        password,
        UserRole: 'CLIENT', // Este valor puedes cambiarlo si lo deseas dinámico
      };

      await authService.signup(signupData); // Llamada al servicio de registro
      Alert.alert('Registro exitoso', 'Ahora puedes iniciar sesión.');
      navigation.navigate('Login'); // Redirige al login
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar. Intenta nuevamente.');
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
        placeholder="Nombre"
        value={firstname}
        onChangeText={setFirstname}
      />
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 10,
          paddingLeft: 8,
        }}
        placeholder="Apellido"
        value={lastname}
        onChangeText={setLastname}
      />
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 10,
          paddingLeft: 8,
        }}
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
      />
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
      <Button title="Registrarse" onPress={handleRegister} />
    </View>
  );
};

export default RegisterScreen;
