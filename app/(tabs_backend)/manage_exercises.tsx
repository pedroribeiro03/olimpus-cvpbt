import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

const ManageExercises = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestão de Exercícios</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/_backend_ginasio/exercises')}
      >
        <Text style={styles.buttonText}>Exercícios de Ginásio</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/_backend_teste_inicial/testesiniciais')}
      >
        <Text style={styles.buttonText}>Testes Iniciais</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/_backend_treino_tecnico/treinos_tecnicos')}
      >
        <Text style={styles.buttonText}>Exercícios Técnicos</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default ManageExercises;
