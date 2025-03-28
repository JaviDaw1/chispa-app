import moment from 'moment';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
  Button,
} from 'react-native';
import { Avatar, Icon } from 'react-native-elements';

import AuthService from '../services/authService';

import 'moment/locale/es'; // Para mostrar fechas en español

moment.locale('es');

const MessageScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const authService = new AuthService();

  const matchId = route.params?.matchId;

  // Función para cargar los datos del chat
  const loadChatData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Obtener usuario actual
      const currentUser = await authService.getUserInfo();
      if (!currentUser || !currentUser.id) {
        throw new Error('No se pudo obtener información del usuario');
      }
      setUser(currentUser);

      // 2. Obtener detalles del match y del otro usuario
      const matchDetails = await authService.getMatchDetails(matchId);
      setOtherUser({
        id:
          currentUser.id === matchDetails.user1_id ? matchDetails.user2_id : matchDetails.user1_id,
        name: matchDetails.name,
        lastName: matchDetails.lastName,
        profilePhoto: matchDetails.profilePhoto,
      });

      // 3. Obtener mensajes (primero de caché, luego de API)
      const cachedMessages = await authService.getStoredMessages();
      if (cachedMessages[matchId]) {
        setMessages(cachedMessages[matchId]);
      }

      const apiMessages = await authService.getMessagesByMatch(matchId);
      setMessages(apiMessages);
      await authService.saveMessagesToStorage(matchId, apiMessages);

      // 4. Marcar mensajes como leídos
      const unreadMessages = apiMessages.filter(
        (msg) => msg.receiverUser_id === currentUser.id && !msg.isRead
      );

      if (unreadMessages.length > 0) {
        await Promise.all(unreadMessages.map((msg) => authService.markMessageAsRead(msg.id)));
      }
    } catch (err) {
      console.error('Error al cargar el chat:', err);
      setError(err.message || 'Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (matchId) {
      loadChatData();
    } else {
      setError('No se especificó un chat válido');
      setLoading(false);
    }
  }, [matchId, loadChatData]);

  // Función para enviar mensaje
  const handleSendMessage = async () => {
    try {
      if (!newMessage.trim() || !user || !otherUser) return;

      const messageData = {
        match_id: matchId,
        content: newMessage.trim(),
        senderUser_id: user.id,
        receiverUser_id: otherUser.id,
      };

      // Enviar mensaje
      const sentMessage = await authService.sendNewMessage(messageData);

      // Actualizar estado local
      setMessages((prev) => [sentMessage, ...prev]);
      setNewMessage('');

      // Actualizar caché
      await authService.saveMessagesToStorage(matchId, [sentMessage, ...messages]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
  };

  // Renderizar cada mensaje
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderUser_id === user?.id;
    const messageDate = moment(item.timestamp);
    const showDate = messageDate.isSame(moment(), 'day')
      ? messageDate.format('HH:mm')
      : messageDate.format('D MMM HH:mm');

    return (
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}>
        {!isCurrentUser && (
          <Avatar
            rounded
            source={{ uri: otherUser?.profilePhoto || 'https://via.placeholder.com/150' }}
            size="small"
            containerStyle={styles.avatar}
          />
        )}

        <View style={styles.messageContent}>
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText,
            ]}>
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
            ]}>
            {showDate}
            {item.isRead && isCurrentUser && (
              <Icon
                name="check"
                type="material-community"
                size={12}
                color="#4CAF50"
                containerStyle={styles.readIcon}
              />
            )}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Cargando mensajes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadChatData}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
        <Button
          title="Volver"
          onPress={() => navigation.goBack()}
          buttonStyle={styles.backButton}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" type="material-community" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          {otherUser?.profilePhoto && (
            <Avatar
              rounded
              source={{ uri: otherUser.profilePhoto }}
              size="small"
              containerStyle={styles.headerAvatar}
            />
          )}
          <Text style={styles.userName}>
            {otherUser?.name} {otherUser?.lastName}
          </Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* Lista de mensajes */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesContainer}
        inverted
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay mensajes aún</Text>
            <Text style={styles.emptySubText}>Envía el primer mensaje</Text>
          </View>
        }
      />

      {/* Input de mensaje */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          onFocus={() => setIsTyping(true)}
          onBlur={() => setIsTyping(false)}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}>
          <Icon
            name="send"
            type="material-community"
            size={24}
            color={newMessage.trim() ? '#4CAF50' : '#ccc'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
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
    marginBottom: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#6c757d',
    borderRadius: 5,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 15,
  },
  headerAvatar: {
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 28, // Mismo ancho que el ícono de volver para balancear
  },
  messagesContainer: {
    padding: 15,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '50%',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currentUserBubble: {
    alignSelf: 'flex-end',
  },
  otherUserBubble: {
    alignSelf: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    padding: 12,
    borderRadius: 15,
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    backgroundColor: '#DCF8C6',
    color: '#000',
    borderTopRightRadius: 0,
  },
  otherUserText: {
    backgroundColor: '#fff',
    color: '#000',
    borderTopLeftRadius: 0,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 5,
  },
  currentUserTime: {
    textAlign: 'right',
    color: '#666',
  },
  otherUserTime: {
    textAlign: 'left',
    color: '#666',
  },
  readIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessageScreen;
