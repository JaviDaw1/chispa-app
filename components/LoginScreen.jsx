import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Aquí iría la lógica de login
    console.log('Iniciando sesión...');
    navigation.navigate('Profile');
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
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Iniciar sesión" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
