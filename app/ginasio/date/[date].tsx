import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, FlatList, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getExercisesForDate } from '@/lib/appwrite';

// Definimos o tipo para cada exercício
type Exercise = {
  nome: string; // Nome do exercício
  series: number; // Número de séries
  reps: number;  // Número de repetições
  idExercicio: string;
};

const PlanoDia = () => {
  const { date } = useLocalSearchParams(); // Captura o parâmetro da URL
  const [exercises, setExercises] = useState<Exercise[]>([]); // Estado tipado
  const [error, setError] = useState<string | null>(null); // Estado para erros
  const [loading, setLoading] = useState<boolean>(true); // Estado de loading

  useEffect(() => {
    console.log("Parâmetro date recebido:", date); // Debug
    if (!date) {
      setError("Data inválida. Tente novamente.");
      setLoading(false); // Para o loading ao detectar erro
      return;
    }

    const fetchExercises = async () => {
      setLoading(true); // Ativa o loading
      try {
        const data: Exercise[] = await getExercisesForDate(date as string); // Chama a função e tipa o retorno
        setExercises(data); // Atualiza o estado com a lista de exercícios
      } catch (err: any) {
        console.error("Erro ao buscar exercícios:", err.message);
        setError("Erro ao carregar os exercícios. Tente novamente.");
      } finally {
        setLoading(false); // Desativa o loading
      }
    };

    fetchExercises();
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
      <Text style={styles.header}>Plano do Dia</Text>
      <Text style={styles.subHeader}>Data: {date}</Text>

      {exercises.length > 0 ? (
        <FlatList
          data={exercises}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.exerciseCard}>
              <TouchableOpacity onPress={() => {
                // Redireciona para a página do exercício com o ID selecionado
                router.push(`/ginasio/exercicio/${item.idExercicio}`);
              }}>
                <Text style={styles.exerciseName}>{item.nome}</Text>
                <Text style={styles.exerciseDetails}>
                  Séries: {item.series} | Reps: {item.reps} 
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <Text style={styles.noDataText}>Nenhum exercício encontrado para esta data.</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1E1E1E', // Fundo cinza escuro para um visual moderno
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  header: {
    fontSize: 28,
    color: '#4CAF50', // Verde para destaque
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    color: '#AAA', // Cinza claro para contraste
    textAlign: 'center',
    marginBottom: 20,
  },
  exerciseCard: {
    padding: 15,
    backgroundColor: '#2C2C2C', // Fundo cinza escuro para os cards
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  exerciseName: {
    fontSize: 20,
    color: '#FFF', // Branco para destaque
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exerciseDetails: {
    fontSize: 16,
    color: '#CCC', // Cinza claro para detalhes
  },
  separator: {
    height: 10, // Espaço entre os cards
  },
  noDataText: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    marginTop: 20,
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
