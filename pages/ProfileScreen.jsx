import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import AuthService from '../services/authService';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authService = new AuthService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = await authService.getUserInfo();
        console.log('Datos del usuario:', userInfo); // Para depuración
        setUser(userInfo);
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No se pudieron cargar los datos del usuario</Text>
        <Button 
          title="Volver" 
          onPress={() => navigation.goBack()} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>
        {user.firstName || user.firstname} {user.lastName || user.lastname}
      </Text>
      
      <Text style={styles.info}>Género: {user.gender}</Text>
      <Text style={styles.info}>Ubicación: {user.location}</Text>
      <Text style={styles.info}>Biografía: {user.bio}</Text>
      <Text style={styles.info}>Intereses: {user.interests}</Text>

      <Button 
        title="Ir a Inicio" 
        onPress={() => navigation.navigate('Home')} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginVertical: 5,
  },
});

export default ProfileScreen;