import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { getAllExercises } from '@/lib/appwrite';

// Define o tipo Exercise
type Exercise = {
  $id: string;
  nome: string;
};

const Exercises = () => {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]); // Aplica o tipo Exercise[]
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // Página atual
  const limit = 25; // Número de exercícios por página

  // Função para carregar os exercícios
  const fetchExercises = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await getAllExercises(limit, offset);
  
      // Mapeia os documentos para garantir que possuem os campos esperados
      const formattedExercises: Exercise[] = response.documents.map((doc) => ({
        $id: doc.$id,
        nome: doc.nome || '', // Garante que nome é uma string
      }));
  
      setExercises(formattedExercises); // Atualiza o estado corretamente
    } catch (error) {
      console.error('Erro ao obter exercícios:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  // Sempre que mudar de página, recarrega os exercícios
  useEffect(() => {
    fetchExercises();
  }, [page]);
  

  // Carrega os exercícios ao montar o componente ou quando a página muda
  useEffect(() => {
    fetchExercises();
  }, [page]);

  // Função para ir para a próxima página
  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Função para voltar à página anterior
  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  // Função para navegar para a tela de criação de exercício
  const navigateToCreateExercise = () => {
    router.push('/_backend_ginasio/create_exercise');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ccc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Exercícios (Página {page})</Text>

      {/* Botão de Criar Exercício */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={navigateToCreateExercise}
      >
        <Text style={styles.createButtonText}>Criar Exercício</Text>
      </TouchableOpacity>

      {/* Lista de Exercícios */}
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.exerciseCard}
          onPress={() => router.push(`/_backend_ginasio/exercise_details/${item.$id}`)}
        >
          <Text style={styles.exerciseName}>{item.nome}</Text>
        </TouchableOpacity>
  )}
/>


      {/* Botões de paginação */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={styles.paginationButton}
          onPress={handlePrevPage}
          disabled={page === 1} // Desabilita o botão na primeira página
        >
          <Text style={styles.paginationButtonText}>Anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.paginationButton}
          onPress={handleNextPage}
        >
          <Text style={styles.paginationButtonText}>Próximo</Text>
        </TouchableOpacity>
      </View>
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  paginationButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  paginationButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Exercises;
