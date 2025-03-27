import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Button } from 'react-native-elements';

import AuthService from '../services/authService';

const PreferenceScreen = ({ navigation }) => {
  const [preferences, setPreferences] = useState({
    minAgeRange: 18,
    maxAgeRange: 99,
    maxDistance: 100,
    favoriteGender: 'OTHER',
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const authService = new AuthService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Obtener usuario logueado
        const userInfo = await authService.getUserInfo();
        setUser(userInfo);

        if (!userInfo || !userInfo.id) {
          throw new Error('No se pudo obtener información del usuario');
        }

        // 2. Intentar obtener preferencias desde AsyncStorage
        const cachedPrefs = await authService.getStoredPreferences();
        if (cachedPrefs) {
          setPreferences(cachedPrefs);
        }

        // 3. Obtener preferencias actualizadas desde API
        const apiPrefs = await authService.getPreferencesByUserId(userInfo.id);
        setPreferences(apiPrefs);
        await authService.savePreferencesToStorage(apiPrefs);
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Error', 'No se pudieron cargar las preferencias');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      if (!user || !user.id) {
        throw new Error('Usuario no identificado');
      }

      setSaving(true);
      const updatedPrefs = await authService.updateUserPreferences(user.id, preferences);
      setPreferences(updatedPrefs);
      await authService.savePreferencesToStorage(updatedPrefs);
      Alert.alert('Éxito', 'Preferencias actualizadas correctamente');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron guardar las preferencias');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Cargando preferencias...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Mis Preferencias de Búsqueda</Text>

        {/* Género Preferido */}
        <View style={styles.preferenceGroup}>
          <Text style={styles.preferenceLabel}>Género de interés</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={preferences.favoriteGender}
              onValueChange={(itemValue) =>
                setPreferences({ ...preferences, favoriteGender: itemValue })
              }>
              <Picker.Item label="Hombres" value="MALE" />
              <Picker.Item label="Mujeres" value="FEMALE" />
              <Picker.Item label="Cualquier género" value="OTHER" />
            </Picker>
          </View>
        </View>

        {/* Rango de Edad */}
        <View style={styles.preferenceGroup}>
          <Text style={styles.preferenceLabel}>Rango de edad</Text>
          <Text style={styles.rangeText}>
            {preferences.minAgeRange} - {preferences.maxAgeRange} años
          </Text>

          <View style={styles.sliderGroup}>
            <Text style={styles.sliderLabel}>Edad mínima: {preferences.minAgeRange}</Text>
            <Slider
              minimumValue={18}
              maximumValue={preferences.maxAgeRange - 1}
              step={1}
              value={preferences.minAgeRange}
              onValueChange={(value) =>
                setPreferences({ ...preferences, minAgeRange: Math.floor(value) })
              }
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#4CAF50"
            />
          </View>

          <View style={styles.sliderGroup}>
            <Text style={styles.sliderLabel}>Edad máxima: {preferences.maxAgeRange}</Text>
            <Slider
              minimumValue={preferences.minAgeRange + 1}
              maximumValue={99}
              step={1}
              value={preferences.maxAgeRange}
              onValueChange={(value) =>
                setPreferences({ ...preferences, maxAgeRange: Math.floor(value) })
              }
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#4CAF50"
            />
          </View>
        </View>

        {/* Distancia Máxima */}
        <View style={styles.preferenceGroup}>
          <Text style={styles.preferenceLabel}>Distancia máxima</Text>
          <Text style={styles.rangeText}>Hasta {preferences.maxDistance} km</Text>
          <Slider
            minimumValue={1}
            maximumValue={500}
            step={1}
            value={preferences.maxDistance}
            onValueChange={(value) =>
              setPreferences({ ...preferences, maxDistance: Math.floor(value) })
            }
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="#4CAF50"
          />
        </View>

        {/* Botón de Guardar */}
        <Button
          title={saving ? 'Guardando...' : 'Guardar Cambios'}
          onPress={handleSave}
          buttonStyle={styles.saveButton}
          titleStyle={styles.saveButtonText}
          disabled={saving}
          loading={saving}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
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
    marginBottom: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  sliderGroup: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  rangeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PreferenceScreen;
