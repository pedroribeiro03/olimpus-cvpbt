import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAllUsers } from '@/lib/appwrite';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

const Users = () => {
  type User = {
    $id: string;
    nome: string;
    desporto: string;
    posicao: string;
    altura: string;
    peso: string;
  };

  const navigation = useNavigation(); // Para navegar entre páginas
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response.documents); // Supondo que os utilizadores vêm dentro de "documents"
      } catch (error) {
        console.error('Erro ao obter utilizadores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ccc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Utilizadores</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userCard}
           // onPress={() => navigation.navigate('UserProfile', { user: { nome: 'Teste', desporto: 'Futebol' } })}

           onPress={() => router.push({
            pathname: '/_backend_ginasio/UserProfile', // Substitua pelo caminho da rota desejada
            params: { 
              id: item.$id, 
              nome: item.nome, 
              desporto: item.desporto, 
              posicao: item.posicao, 
              peso: item.peso, 
              altura: item.altura 
            }
          })}

           // onPress={() => navigation.navigate('UserProfile', { user: item })} // Envia os dados para a outra página
          >
            <Text style={styles.userName}>{item.nome}</Text>
            <Text style={styles.userInfo}>Desporto: {item.desporto}</Text>
            <Text style={styles.userInfo}>Posição: {item.posicao}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    fontSize: 14,
    color: '#bbb',
  },
});

export default Users;
