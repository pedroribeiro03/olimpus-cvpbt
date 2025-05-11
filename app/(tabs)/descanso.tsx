import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, View } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { generateRecoveryAdvice, getCurrentUser } from '@/lib/appwrite';  // Importa a função para gerar o aconselhamento

// Componente para mensagens
const MessageItem = ({ message, isUser }: { message: string; isUser: boolean }) => {
  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.gptMessage]}>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
};

const DescansoScreen = () => {
  const [messages, setMessages] = useState<any[]>([]); // Armazenar mensagens
  const [inputText, setInputText] = useState(''); // Texto do input
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [userId, setUserId] = useState<string | null>(null);  // Armazenando o ID do usuário

  // Função para enviar a mensagem do usuário
  const sendMessage = async () => {
    if (inputText.trim() === '') return; // Não envia se estiver vazio

    // Adiciona a mensagem do usuário
    setMessages(prevMessages => [
      ...prevMessages,
      { text: inputText, isUser: true },
    ]);
    
    // Limpar o input
    setInputText('');

    // Definir carregamento
    setLoading(true);

    try {
      // Gerar o aconselhamento de recuperação com base na dúvida do usuário
      const advice = await generateRecoveryAdvice(userId, inputText);

      // Adicionar a resposta do GPT à lista de mensagens
      setMessages(prevMessages => [
        ...prevMessages,
        { text: advice, isUser: false },
      ]);

      // Exibir a resposta no log para verificar a resposta
      console.log("Resposta da IA: ", advice);

      setLoading(false);  // Finaliza o carregamento
    } catch (error) {
      console.error('Erro ao obter o aconselhamento:', error);
      setLoading(false);  // Finaliza o carregamento
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUserId(currentUser.IDUtilizador); // Defina o ID do usuário logado
        } else {
          console.log("Usuário não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao obter usuário:", error);
      }
    };

    fetchUserId();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Aconselhamento de Recuperação</Text>

      {/* Lista de mensagens */}
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <MessageItem message={item.text} isUser={item.isUser} />
        )}
        style={styles.messagesContainer}
      />

      {/* Input de texto para enviar mensagens */}
      <TextInput
        style={styles.input}
        placeholder="Digite sua dúvida sobre recuperação..."
        value={inputText}
        onChangeText={setInputText}
      />

      {/* Botão de envio */}
      <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
        <Text style={styles.buttonText}>Enviar</Text>
      </TouchableOpacity>

      {/* Exibição do indicador de carregamento */}
      {loading && (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 20,
  },
  messageContainer: {
    marginBottom: 10,
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
  },
  userMessage: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-end',
    borderTopLeftRadius: 0,
  },
  gptMessage: {
    backgroundColor: '#333',
    alignSelf: 'flex-start',
    borderTopRightRadius: 0,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  loading: {
    marginTop: 20,
  },
});

export default DescansoScreen;
