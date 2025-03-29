import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { getAllTreinosTecnicos } from '@/lib/appwrite';

export default function TreinosTecnicos() {
  const router = useRouter();
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 25;

  const fetchTreinos = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await getAllTreinosTecnicos(limit, offset);
      setTreinos(response.documents);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreinos();
  }, [page]);

  const handleDetails = (id: string) => {
    router.push(`/_backend_treino_tecnico/${id}`);
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Treinos Técnicos</Text>
      
      <FlatList
        data={treinos}
        keyExtractor={item => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item} 
            onPress={() => handleDetails(item.$id)}
          >
            <Text style={styles.itemTitle}>{item.nome}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    padding: 15,
    backgroundColor: '#2a2a2a',
    marginBottom: 10,
    borderRadius: 8,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 16,
  },
});