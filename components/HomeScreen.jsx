import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bienvenido a Chispa</Text>
      <Button title="Ir al Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
};

export default HomeScreen;
