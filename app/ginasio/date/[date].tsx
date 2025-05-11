import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, FlatList, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getExercisesForDate, getTechnicalExercisesForDate } from '@/lib/appwrite';
import { ScrollView } from 'react-native-gesture-handler';

// Tipo para exercícios de ginásio
type GymExercise = {
  nome: string;
  series: number;
  reps: number;
  idExercicio: string;
};

// Tipo para exercícios técnicos
type TechExercise = {
  nome: string;
  idExercicio: string;
};

const PlanoDia = () => {
  const { date } = useLocalSearchParams<{ date: string }>();
  const [gymExercises, setGymExercises] = useState<GymExercise[]>([]);
  const [techExercises, setTechExercises] = useState<TechExercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!date) {
      setError('Data inválida. Tente novamente.');
      setLoading(false);
      return;
    }

    const fetchPlans = async () => {
      setLoading(true);
      try {
        const gymData = await getExercisesForDate(date);
        setGymExercises(gymData);

        const techData = await getTechnicalExercisesForDate(date);
        setTechExercises(techData);
      } catch (err: any) {
        console.error('Erro ao buscar planos do dia:', err.message);
        setError('Erro ao carregar os planos.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [date]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <Text style={styles.header}>Plano do Dia</Text>
      <Text style={styles.subHeader}>Data: {date}</Text>

      {/* Seção Treino de Ginásio */}
      <Text style={styles.sectionTitle}>Treino de Ginásio</Text>
      {gymExercises.length > 0 ? (
        <FlatList
          data={gymExercises}
          keyExtractor={(item) => item.idExercicio}
          renderItem={({ item }) => (
            <View style={styles.exerciseCard}>
              <TouchableOpacity onPress={() => router.push(`/ginasio/exercicio/${item.idExercicio}`)}>
                <Text style={styles.exerciseName}>{item.nome}</Text>
                <Text style={styles.exerciseDetails}>
                  Séries: {item.series} | Reps: {item.reps}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.list}
        />
      ) : (
        <Text style={styles.noDataText}>Nenhum exercício de ginásio para esta data.</Text>
      )}

      {/* Seção Treino Técnico */}
      <Text style={styles.sectionTitle}>Treino Técnico</Text>
      {techExercises.length > 0 ? (
        <FlatList
          data={techExercises}
          keyExtractor={(item) => item.idExercicio}
          renderItem={({ item }) => (
            <View style={styles.exerciseCard}>
              <TouchableOpacity onPress={() => router.push(`/ginasio/exerciciotecnico/${item.idExercicio}`)}>
                <Text style={styles.exerciseName}>{item.nome}</Text>
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.list}
        />
      ) : (
        <Text style={styles.noDataText}>Nenhum exercício técnico para esta data.</Text>
      )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1E1E1E',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  header: {
    fontSize: 28,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  list: {
    marginBottom: 16,
  },
  exerciseCard: {
    padding: 15,
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  exerciseName: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exerciseDetails: {
    fontSize: 16,
    color: '#CCC',
  },
  separator: {
    height: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#AAA',
    marginTop: 10,
  },
});

export default PlanoDia;
