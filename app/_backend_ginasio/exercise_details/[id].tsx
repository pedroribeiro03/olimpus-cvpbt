import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { getExerciseByIdBackend, updateExercise, getGruposMusculares, deleteExercise } from '@/lib/appwrite';

const ExerciseDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Obtém o ID do exercício da URL
  const [nome, setNome] = useState('');
  const [video, setVideo] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [grupoMuscular1, setGrupoMuscular1] = useState(null);
  const [grupoMuscular2, setGrupoMuscular2] = useState(null);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [loading, setLoading] = useState(true);

  // Função para carregar os dados do exercício e os grupos musculares
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Força o id a ser uma string
        const exerciseId = String(id);
  
        // Busca os detalhes do exercício (para backend)
        const exercise = await getExerciseByIdBackend(exerciseId);
        if (exercise && exercise.length > 0) {
          const exerciseData = exercise[0]; // Acessa o primeiro objeto do array
  
          // Busca os grupos musculares para o dropdown
          const groups = await getGruposMusculares();
          setMuscleGroups(groups);
  
          // Define os valores dos dropdowns APÓS carregar os grupos musculares
          setNome(exerciseData.nome);
          setVideo(exerciseData.video);
          setInstrucoes(exerciseData.instrucoes);
          setGrupoMuscular1(exerciseData.grupoMuscular1);
          setGrupoMuscular2(exerciseData.grupoMuscular2);
        } else {
          Alert.alert('Erro', 'Exercício não encontrado.');
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados do exercício.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);

  // Função para atualizar o exercício
  const handleUpdateExercise = async () => {
    if (!nome || !video || !instrucoes || !grupoMuscular1 || !grupoMuscular2) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    try {
      await updateExercise(id, nome, video, instrucoes, grupoMuscular1, grupoMuscular2);
      Alert.alert('Sucesso', 'Exercício atualizado com sucesso!');
      router.back(); // Volta para a tela anterior
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o exercício.');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteExercise(id as string); // Apaga o exercício
      Alert.alert('Exercício apagado', 'O exercício foi removido com sucesso.');
      router.push('/(tabs_backend)/exercises'); // Redireciona para a lista de exercícios
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível apagar o exercício.');
    }
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

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.editButton]}>
            <Text style={styles.buttonText}>Atualizar Exercício</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
            <Text style={styles.buttonText}>Apagar Exercício</Text>
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
    flex: 1, // Faz com que ambos tenham o mesmo tamanho
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5, // Dá um pequeno espaço entre os botões
  },

  editButton: {
    backgroundColor: '#28A745', // Verde
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
  },

  deleteButton: {
    backgroundColor: '#DC3545', // Vermelho
  },


 

  buttonContainer: {
    flexDirection: 'row',
    gap: 15, // Adiciona espaço entre os botões
  },
});

export default ExerciseDetails;