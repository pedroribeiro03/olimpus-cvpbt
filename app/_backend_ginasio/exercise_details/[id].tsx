import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { updateExercise, getExerciseByIdBackend, getGruposMusculares, deleteExercise } from '@/lib/appwrite';

const EditExercise = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [nome, setNome] = useState('');
  const [video, setVideo] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [grupoMuscular1, setGrupoMuscular1] = useState(null);
  const [grupoMuscular2, setGrupoMuscular2] = useState(null);
  const [muscleGroups, setMuscleGroups] = useState<{ label: string; value: string }[]>([]);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [grupos, exercicioData] = await Promise.all([
          getGruposMusculares(),
          getExerciseByIdBackend(id)
        ]);

        setMuscleGroups(grupos);

        if (exercicioData) {
            const ex = exercicioData[0]
          setNome(ex.nome || '');
          setVideo(ex.video || '');
          setInstrucoes(ex.instrucoes || '');
          setGrupoMuscular1(ex.grupoMuscular1 || null);
          setGrupoMuscular2(ex.grupoMuscular2 || null);
        } else {
          Alert.alert('Erro', 'Exercício não encontrado.');
          router.back();
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados do exercício.');
        console.error('Erro ao carregar:', error);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleUpdateExercise = async () => {
    if (!nome || !video || !instrucoes || !grupoMuscular1) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios (Grupo Muscular 2 é opcional).');
      return;
    }

    setIsUpdating(true);
    try {
      await updateExercise(id, nome, video, instrucoes, grupoMuscular1, grupoMuscular2);
      Alert.alert('Sucesso', 'Exercício atualizado com sucesso!');
      router.replace('/_backend_ginasio/exercises');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o exercício.');
      console.error('Erro na atualização:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteExercise = () => {
    Alert.alert(
      'Confirmar remoção',
      'Tens a certeza que queres apagar este exercício?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => confirmDelete(),
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteExercise(id);
      if (result) {
        Alert.alert('Sucesso', 'Exercício apagado com sucesso!');
        router.replace('/_backend_ginasio/exercises');
      } else {
        throw new Error('Falha ao apagar');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível apagar o exercício.');
      console.error('Erro ao apagar:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>A carregar exercício...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do Exercício*</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite o nome do exercício"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Link do Vídeo*</Text>
      <TextInput
        style={styles.input}
        value={video}
        onChangeText={setVideo}
        placeholder="Digite o link do vídeo"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Instruções*</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        value={instrucoes}
        onChangeText={setInstrucoes}
        placeholder="Digite as instruções"
        placeholderTextColor="#999"
        multiline
      />

      <Text style={styles.label}>Grupo Muscular 1*</Text>
      <DropDownPicker
        open={open1}
        value={grupoMuscular1}
        items={muscleGroups}
        setOpen={setOpen1}
        setValue={setGrupoMuscular1}
        placeholder="Selecione um grupo muscular"
        placeholderStyle={{ color: '#999' }}
        style={styles.dropdown}
        zIndex={3000}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      <Text style={styles.label}>Grupo Muscular 2</Text>
      <DropDownPicker
        open={open2}
        value={grupoMuscular2}
        items={muscleGroups}
        setOpen={setOpen2}
        setValue={setGrupoMuscular2}
        placeholder="Opcional"
        placeholderStyle={{ color: '#999' }}
        style={styles.dropdown}
        zIndex={2000}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      <TouchableOpacity 
        style={[styles.button, isUpdating && styles.disabledButton]} 
        onPress={handleUpdateExercise}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Atualizar Exercício</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.deleteButton, isDeleting && styles.disabledButton]} 
        onPress={handleDeleteExercise}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Apagar Exercício</Text>
        )}
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
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: '#333',
    borderColor: '#444',
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 48,
  },
  dropdownContainer: {
    backgroundColor: '#333',
    borderColor: '#444',
    zIndex: 1000,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    justifyContent: 'center',
    height: 50,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'center',
    height: 50,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default EditExercise;