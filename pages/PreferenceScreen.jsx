import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';

import AuthService from '../services/authService';

const PreferenceScreen = ({ navigation }) => {
  const [preferences, setPreferences] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authService = new AuthService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Obtener usuario logueado
        const userInfo = await authService.getUserInfo();
        if (!userInfo || !userInfo.id) {
          throw new Error('No se pudo obtener información del usuario');
        }
        setUser(userInfo);

        // 2. Intentar obtener preferencias desde AsyncStorage (cache)
        const cachedPrefs = await authService.getStoredPreferences();
        if (cachedPrefs) {
          setPreferences(cachedPrefs);
        }

        // 3. Obtener preferencias actualizadas desde la API
        const apiPrefs = await authService.getPreferencesByUserId(userInfo.id);
        setPreferences(apiPrefs);
        await authService.savePreferencesToStorage(apiPrefs);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Error al cargar las preferencias');
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
        <Text>Cargando preferencias...</Text>
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

  // Función para traducir valores ENUM a texto legible
  const translateGender = (gender) => {
    switch (gender) {
      case 'MALE':
        return 'Hombres';
      case 'FEMALE':
        return 'Mujeres';
      case 'OTHER':
        return 'Cualquier género';
      default:
        return gender;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Mis Preferencias de Búsqueda</Text>

      {/* Género Preferido */}
      <View style={styles.preferenceGroup}>
        <Text style={styles.label}>Género de interés</Text>
        <Text style={styles.info}>
          {preferences?.favoriteGender
            ? translateGender(preferences.favoriteGender)
            : 'No especificado'}
        </Text>
      </View>

      {/* Rango de Edad */}
      <View style={styles.preferenceGroup}>
        <Text style={styles.label}>Rango de edad</Text>
        <Text style={styles.info}>
          {preferences?.minAgeRange || '18'} - {preferences?.maxAgeRange || '99'} años
        </Text>
      </View>

      {/* Distancia Máxima */}
      <View style={styles.preferenceGroup}>
        <Text style={styles.label}>Distancia máxima</Text>
        <Text style={styles.info}>
          {preferences?.maxDistance ? `${preferences.maxDistance} km` : 'No especificada'}
        </Text>
      </View>

      {/* Botones de acción */}
      <View style={styles.buttonContainer}>
        <Button
          title="Volver"
          onPress={() => navigation.goBack()}
          buttonStyle={styles.backButton}
        />
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
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  preferenceGroup: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#555',
  },
  info: {
    fontSize: 16,
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
  backButton: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    paddingVertical: 10,
  },
});

export default PreferenceScreen;
