import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Avatar } from 'react-native-elements';

import AuthService from '../services/authService';

import 'moment/locale/es';

moment.locale('es');

const MatchScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const authService = new AuthService();

  const loadMatches = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Obtener usuario actual
      const user = await authService.getUserInfo();
      if (!user || !user.id) {
        throw new Error('No se pudo obtener información del usuario');
      }
      setCurrentUser(user);

      // Cargar matches desde la API
      const matchesData = await authService.getUserMatches(user.id);
      setMatches(matchesData);

      // Guardar en caché
      await authService.saveMatchesToStorage(matchesData);
    } catch (err) {
      console.error('Error al cargar matches:', err);
      setError(err.message || 'Error al cargar matches');

      // Intentar cargar de caché si hay error
      const cachedMatches = await authService.getStoredMatches();
      if (cachedMatches.length > 0) {
        setMatches(cachedMatches);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Cargar datos iniciales
    const initializeData = async () => {
      setLoading(true);

      // Primero cargar de caché para mejor experiencia
      const cachedMatches = await authService.getStoredMatches();
      if (cachedMatches.length > 0) {
        setMatches(cachedMatches);
      }

      // Luego actualizar desde la API
      await loadMatches();
    };

    initializeData();
  }, []);

  const renderMatchItem = ({ item }) => {
    const matchDate = moment(item.matchDate);
    const showDate = matchDate.isSame(moment(), 'day')
      ? matchDate.format('HH:mm')
      : matchDate.format('D MMM [a las] HH:mm');

    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() =>
          navigation.navigate('Messages', {
            matchId: item.id,
            otherUserId: item.user1_id === currentUser?.id ? item.user2_id : item.user1_id,
          })
        }>
        <Avatar
          rounded
          source={{ uri: item.profilePhoto || 'https://via.placeholder.com/150' }}
          size="medium"
        />

        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>
            {item.name} {item.lastName}
          </Text>
          <Text style={styles.matchDate}>Match el {showDate}</Text>
          {item.lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage.content}
            </Text>
          )}
        </View>

        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && matches.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Cargando matches...</Text>
      </View>
    );
  }

  if (error && matches.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMatches}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus Matches</Text>

      <FlatList
        data={matches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadMatches}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {/* <Image source={require('../assets/no-matches.png')} style={styles.emptyImage} /> */}
            <Text style={styles.emptyTitle}>No tienes matches aún</Text>
            <Text style={styles.emptyText}>Cuando hagas match con alguien, aparecerá aquí</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchInfo: {
    marginLeft: 15,
    flex: 1,
  },
  matchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  matchDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  unreadBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MatchScreen;
