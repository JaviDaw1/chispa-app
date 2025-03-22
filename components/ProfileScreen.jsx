import React from 'react';
import { View, Text, Button } from 'react-native';

const ProfileScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Perfil de Usuario</Text>
      <Button title="Cerrar sesión" onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

export default ProfileScreen;
