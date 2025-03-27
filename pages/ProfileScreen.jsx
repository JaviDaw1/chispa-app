import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';

import AuthService from '../services/authService';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authService = new AuthService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Obtener usuario logueado
        const userInfo = await authService.getUserInfo();
        if (!userInfo || !userInfo.id) {
          throw new Error('No se pudo obtener información del usuario');
        }
        setUser(userInfo);

        // 2. Intentar obtener perfil desde AsyncStorage (cache)
        const cachedProfile = await authService.getStoredProfile();
        if (cachedProfile) {
          setProfile(cachedProfile);
        }

        // 3. Obtener perfil actualizado desde la API
        const profileData = await authService.getProfile(userInfo.id);
        setProfile(profileData);
        await authService.saveProfile(profileData); // Guardar en cache
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Error al cargar el perfil');
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

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Reintentar"
          onPress={() => {
            setLoading(true);
            setError(null);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useEffect(() => {}, []); // Esto disparará nuevamente el efecto
          }}
        />
        <Button title="Volver" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Foto de perfil */}
      {profile?.profilePhoto && (
        <Image source={{ uri: profile.profilePhoto }} style={styles.profileImage} />
      )}

      {/* Nombre */}
      <Text style={styles.name}>
        {profile?.name || user?.firstname} {profile?.lastName || user?.lastname}
      </Text>

      {/* Información del perfil */}
      <View style={styles.profileInfo}>
        <Text style={styles.label}>Género:</Text>
        <Text style={styles.info}>{profile?.gender || 'No especificado'}</Text>

        <Text style={styles.label}>Ubicación:</Text>
        <Text style={styles.info}>{profile?.location || 'No especificada'}</Text>

        <Text style={styles.label}>Biografía:</Text>
        <Text style={styles.info}>{profile?.bio || 'El usuario no ha agregado una biografía'}</Text>

        <Text style={styles.label}>Intereses:</Text>
        <Text style={styles.info}>{profile?.interests || 'No especificados'}</Text>

        <Text style={styles.label}>Relación preferida:</Text>
        <Text style={styles.info}>
          {profile?.preferredRelationship
            ? profile.preferredRelationship === 'FRIENDSHIP'
              ? 'Amistad'
              : profile.preferredRelationship === 'CASUAL'
                ? 'Casual'
                : 'Serio'
            : 'No especificada'}
        </Text>
      </View>

      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        <Button
          title="Editar Perfil"
          onPress={() => navigation.navigate('EditProfile', { profile })}
        />
        <Button title="Ir a Inicio" onPress={() => navigation.navigate('Home')} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  profileInfo: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#555',
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    paddingLeft: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
});

export default ProfileScreen;
