import React from 'react';
import { SafeAreaView, Text, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const ExercicioDetalhes = () => {
  const { exercicio } = useLocalSearchParams(); // Pega o parâmetro da URL

  // Dados de exemplo (você provavelmente obterá isso de uma API ou base de dados)
  const exerciseDetails = {
    titulo: exercicio || "Título do Exercício",
    instrucoes: "Aqui estão as instruções para executar este exercício.",
    video: "https://www.youtube.com/embed/ExemploVideo",
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{exerciseDetails.titulo}</Text>
      <Text style={styles.instructions}>{exerciseDetails.instrucoes}</Text>
      <View style={styles.videoContainer}>
        <iframe
          src={exerciseDetails.video}
          width="100%"
          height="200"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1E1E1E',
  },
  title: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 20,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExercicioDetalhes;
