import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { getExerciseById } from "@/lib/appwrite";
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView, FlatList } from "react-native";

type ExerciseDetails = {
  id: string;
  nome: string;
  video: string;
  instrucoes: string;
  grupoMuscular1: string;
  grupoMuscular2: string;
};

const ExercícioDetalhes = () => {
  const { id } = useLocalSearchParams(); // Captura o parâmetro dinâmico "id"
  const [exercise, setExercise] = useState<ExerciseDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      try {
        const exercicio: ExerciseDetails[] = await getExerciseById(id as string);
        if (!exercicio) throw new Error("Exercício não encontrado!");

        setExercise(exercicio);
      } catch (err: any) {
        console.error("Erro ao carregar exercício:", err.message);
        setError("Erro ao carregar os detalhes do exercício.");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#999" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <FlatList
          data={exercise}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.exerciseContainer}>
              <Text style={styles.exerciseTitle}>{item.nome}</Text>

              {item.video ? (
                <View style={styles.videoContainer}>
                  <iframe
                    width="100%"
                    height="250"
                    src={`https://www.youtube.com/embed/${item.video.split('v=')[1]}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </View>
              ) : (
                <Text style={styles.noVideoText}>Vídeo não disponível</Text>
              )}

              <View style={styles.instructionContainer}>
                <Text style={styles.instructionTitle}>Instruções</Text>
                <Text style={styles.instructionText}>{item.instrucoes}</Text>
              </View>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // fundo escuro
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212", // fundo escuro
  },
  exerciseContainer: {
    marginBottom: 30,
    backgroundColor: "#1C1C1C", // cinza escuro
    borderRadius: 12,
    padding: 16,
  },
  exerciseTitle: {
    fontSize: 28,
    color: "#FFFFFF", // texto branco
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  videoContainer: {
    alignSelf: "center", // centraliza o vídeo
    width: "100%",
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#333", // cinza escuro para o vídeo
    marginBottom: 20,
  },
  noVideoText: {
    color: "#AAA", // cinza claro
    textAlign: "center",
    marginBottom: 20,
  },
  instructionContainer: {
    marginTop: 20,
  },
  instructionTitle: {
    fontSize: 22,
    color: "#FFFFFF", // texto branco
    fontWeight: "bold",
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    color: "#E0E0E0", // cinza claro
    lineHeight: 24,
    textAlign: "justify",
  },
  loadingText: {
    fontSize: 18,
    color: "#AAA", // cinza claro
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});

export default ExercícioDetalhes;
