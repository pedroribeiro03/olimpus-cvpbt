import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { createExercise, getGruposMusculares } from '@/lib/appwrite';

const CreateExercise = () => {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [video, setVideo] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [grupoMuscular1, setGrupoMuscular1] = useState(null);
  const [grupoMuscular2, setGrupoMuscular2] = useState(null);
  const [muscleGroups, setMuscleGroups] = useState<{ label: string; value: string }[]>([]);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [loading, setLoading] = useState(true);

  // Busca os grupos musculares ao carregar o componente
  useEffect(() => {
    const fetchMuscleGroups = async () => {
      try {
        const groups = await getGruposMusculares();
        setMuscleGroups(groups);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os grupos musculares.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMuscleGroups();
  }, []);

  const handleCreateExercise = async () => {
    if (!nome || !video || !instrucoes || !grupoMuscular1 || !grupoMuscular2) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    try {
      await createExercise(nome, video, instrucoes, grupoMuscular1, grupoMuscular2);
      Alert.alert('Sucesso', 'Exercício criado com sucesso!');
      router.replace('/(tabs_backend)/exercises'); // Navega de volta e recarrega os dados
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar o exercício.');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando grupos musculares...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do Exercício</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite o nome do exercício"
      />

      <Text style={styles.label}>Link do Vídeo</Text>
      <TextInput
        style={styles.input}
        value={video}
        onChangeText={setVideo}
        placeholder="Digite o link do vídeo"
      />

      <Text style={styles.label}>Instruções</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={instrucoes}
        onChangeText={setInstrucoes}
        placeholder="Digite as instruções"
        multiline
      />

      <Text style={styles.label}>Grupo Muscular 1</Text>
      <DropDownPicker
        open={open1}
        value={grupoMuscular1}
        items={muscleGroups}
        setOpen={setOpen1}
        setValue={setGrupoMuscular1}
        placeholder="Selecione um grupo muscular"
        style={styles.dropdown}
        zIndex={3000}
        dropDownContainerStyle={{ zIndex: 3000 }}
      />

      <Text style={styles.label}>Grupo Muscular 2</Text>
      <DropDownPicker
        open={open2}
        value={grupoMuscular2}
        items={muscleGroups}
        setOpen={setOpen2}
        setValue={setGrupoMuscular2}
        placeholder="Selecione um grupo muscular"
        style={styles.dropdown}
        zIndex={2000}
        dropDownContainerStyle={{ zIndex: 2000 }}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateExercise}>
        <Text style={styles.buttonText}>Salvar Exercício</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default CreateExercise;