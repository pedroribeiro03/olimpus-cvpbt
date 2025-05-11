import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { getExercicioTecnicoById, updateExercicioTecnico, deleteExercicioTecnico } from '@/lib/appwrite';

const EditExercicioTecnico = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [nome, setNome] = useState('');
  const [video, setVideo] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [desporto, setDesporto] = useState<string | null>(null);
  const [openDesporto, setOpenDesporto] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const desportoOptions = [
    { label: 'Rugby', value: 'Rugby' },
    { label: 'Futebol', value: 'Futebol' }
  ];

  // Carrega dados do exercício técnico
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getExercicioTecnicoById(id);
        if (data && data.length > 0) {
          const ex = data[0];
          setNome(ex.nome || '');
          setVideo(ex.video || '');
          setInstrucoes(ex.instrucoes || '');
          setDesporto(ex.desporto || null);
        } else {
          Alert.alert('Erro', 'Exercício técnico não encontrado.');
          router.back();
        }
      } catch (error) {
        console.error('Erro ao carregar exercício técnico:', error);
        Alert.alert('Erro', 'Não foi possível carregar o exercício técnico.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleUpdate = async () => {
    // validação
    if (!nome.trim() || !video.trim() || !instrucoes.trim() || !desporto) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }
    setIsUpdating(true);
    try {
      await updateExercicioTecnico(id, nome.trim(), video.trim(), instrucoes.trim(), desporto);
      Alert.alert('Sucesso', 'Exercício técnico atualizado com sucesso!');
      router.replace('/_backend_treino_tecnico/treinos_tecnicos');
    } catch (error) {
      console.error('Erro na atualização:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o exercício técnico.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar remoção',
      'Tens a certeza que queres apagar este exercício técnico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: confirmDelete }
      ]
    );
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteExercicioTecnico(id);
      Alert.alert('Sucesso', 'Exercício técnico apagado com sucesso!');
      router.replace('/_backend_treino_tecnico/treinos_tecnicos');
    } catch (error) {
      console.error('Erro ao apagar:', error);
      Alert.alert('Erro', 'Não foi possível apagar o exercício técnico.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>A carregar exercício técnico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do Exercício Técnico*</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite o nome"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Link do Vídeo*</Text>
      <TextInput
        style={styles.input}
        value={video}
        onChangeText={setVideo}
        placeholder="Digite a URL do vídeo"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Instruções*</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={instrucoes}
        onChangeText={setInstrucoes}
        placeholder="Digite as instruções"
        placeholderTextColor="#999"
        multiline
      />

      <Text style={styles.label}>Desporto*</Text>
      <DropDownPicker
        open={openDesporto}
        value={desporto}
        items={desportoOptions}
        setOpen={setOpenDesporto}
        setValue={setDesporto}
        placeholder="Selecione o desporto"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdown}
      />

      <TouchableOpacity
        style={[styles.button, isUpdating && styles.disabledButton]}
        onPress={handleUpdate}
        disabled={isUpdating}
      >
        {isUpdating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Atualizar</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.deleteButton, isDeleting && styles.disabledButton]}
        onPress={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Apagar</Text>}
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

export default EditExercicioTecnico;
