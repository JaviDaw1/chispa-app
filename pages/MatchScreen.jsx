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
  const [profiles, setProfiles] = useState({});
  const authService = new AuthService();

  const loadOtherUserProfile = async (userId) => {
    try {
      if (profiles[userId]) return profiles[userId];

      const profileData = await authService.getProfile(userId);
      console.log(`Perfil cargado para ${userId}:`, profileData);

      const formattedProfile = {
        name: profileData?.name || profileData?.firstname || 'Usuario',
        lastName: profileData?.lastName || profileData?.lastname || '',
        profilePhoto: profileData?.profilePhoto || 'https://via.placeholder.com/150',
      };

      setProfiles((prev) => ({
        ...prev,
        [userId]: formattedProfile,
      }));

      return formattedProfile;
    } catch (err) {
      console.error('Error al cargar perfil:', err);
      return {
        name: 'Usuario',
        lastName: '',
        profilePhoto: 'https://via.placeholder.com/150',
      };
    }
  };

  const loadMatches = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const user = await authService.getUserInfo();
      if (!user || !user.id) {
        throw new Error('No se pudo obtener información del usuario');
      }
      setCurrentUser(user);

      const matchesData = await authService.getUserMatches(user.id);
      console.log('Matches recibidos:', matchesData);
      setMatches(matchesData);
      await authService.saveMatchesToStorage(matchesData);

      // Cargar perfiles de los usuarios con los que hizo match
      const profilePromises = matchesData.map(async (match) => {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        const profile = await loadOtherUserProfile(otherUserId);
        return { userId: otherUserId, profile };
      });

      const loadedProfiles = await Promise.all(profilePromises);
      const newProfiles = Object.fromEntries(loadedProfiles.map((p) => [p.userId, p.profile]));

      setProfiles((prev) => ({
        ...prev,
        ...newProfiles,
      }));
    } catch (err) {
      console.error('Error al cargar matches:', err);
      setError(err.message || 'Error al cargar matches');

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
    loadMatches();
  }, []);

  const renderMatchItem = ({ item }) => {
    const matchDate = moment(item.matchDate);
    const showDate = matchDate.isSame(moment(), 'day')
      ? matchDate.format('HH:mm')
      : matchDate.format('D MMM [a las] HH:mm');

    const otherUserId = item.user1_id === currentUser?.id ? item.user2_id : item.user1_id;
    const otherUserProfile = profiles[otherUserId] || {
      name: 'Cargando...',
      lastName: '',
      profilePhoto: 'https://via.placeholder.com/150',
    };

    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() =>
          navigation.navigate('Messages', {
            matchId: item.id,
            otherUserId: otherUserId,
          })
        }>
        <Avatar rounded source={{ uri: otherUserProfile.profilePhoto }} size="medium" />

        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>
            {otherUserProfile.name} {otherUserProfile.lastName}
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus Matches</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text>Cargando...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadMatches} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadMatches} colors={['#4CAF50']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No tienes matches aún</Text>
              <Text style={styles.emptyText}>Cuando hagas match con alguien, aparecerá aquí.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 15 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#f44336', fontSize: 16, marginBottom: 20, textAlign: 'center' },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 20, color: '#333' },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchInfo: { marginLeft: 15, flex: 1 },
  matchName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  matchDate: { fontSize: 12, color: '#666', marginTop: 2 },
  unreadBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});

export default MatchScreen;
