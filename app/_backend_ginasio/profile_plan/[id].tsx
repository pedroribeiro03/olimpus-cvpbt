import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getExercisesForDateBE } from '@/lib/appwrite';

type Exercise = {
  idExercicio: string;
  nome: string;
  series: number;
  reps: number;
};

const DateExercisesScreen = () => {
  const { id: userId, selectedDate, userName } = useLocalSearchParams<{
    id: string;
    selectedDate: string;
    userName: string;
  }>();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadExercises = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userIdStr = Array.isArray(userId) ? userId[0] : userId;
      const dateStr = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate;
      
      if (!userIdStr || !dateStr) {
        throw new Error("Dados incompletos para carregar exercícios");
      }

      console.log('Carregando exercícios para:', { userIdStr, dateStr }); // Debug
      const exercises = await getExercisesForDateBE(userIdStr, dateStr);
      setExercises(exercises);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
      setError('Erro ao carregar exercícios. Tente novamente.');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedDate]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  useFocusEffect(
    useCallback(() => {
      loadExercises();
    }, [loadExercises])
  );

  const handleAddExercises = () => {
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    const dateStr = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate;
    const userNameStr = Array.isArray(userName) ? userName[0] : userName;

    console.log('Navegando para ListScreen com:', { userIdStr, dateStr, userNameStr }); // Debug

    router.push({
      pathname: '/_backend_ginasio/profile_plan/list',
      params: { 
        id: userIdStr,
        selectedDate: dateStr,
        userName: userNameStr
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadExercises}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dateString = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate;
  const displayDate = dateString ? new Date(dateString).toLocaleDateString('pt-PT') : 'Data não especificada';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plano de Treino</Text>
      <Text style={styles.subtitle}>
        Para {Array.isArray(userName) ? userName[0] : userName} em {displayDate}
      </Text>

      {exercises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum exercício planeado para este dia</Text>
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.idExercicio}
          renderItem={({ item }) => (
            <View style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{item.nome}</Text>
              <Text style={styles.exerciseDetails}>
                {item.series} séries × {item.reps} repetições
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddExercises}
      >
        <Text style={styles.addButtonText}>
          {exercises.length === 0 ? 'Adicionar Exercícios' : 'Adicionar Mais Exercícios'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0c0c0c',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0c0c0c',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 18,
  },
  exerciseCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  exerciseDetails: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default DateExercisesScreen;