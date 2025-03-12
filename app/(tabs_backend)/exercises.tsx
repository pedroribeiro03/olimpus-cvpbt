import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAllExercises } from '@/lib/appwrite';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
const Exercises = () => {
    const router = useRouter();
  

  type Exercise = {
    $id: string;
    nome: string;
  };
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await getAllExercises();
        setExercises(response.documents.map((doc) => ({
          $id: doc.$id,
          nome: doc.nome,
        })));
      } catch (error) {
        console.error('Erro ao obter exercícios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
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
      <TouchableOpacity style={styles.createButton} onPress={() => {
          // Redireciona para a página do plano do dia com o dia selecionado na URL
          router.replace(`/(tabs_backend)/_backend_ginasio/create_exercise`);
        }}>
        <Text style={styles.createButtonText}>Criar Exercício</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Lista de Exercícios</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{item.nome}</Text>
          </View>
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
  exerciseCard: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Exercises;
