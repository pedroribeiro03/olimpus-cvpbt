import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getAllExercises, createWorkoutSession, createExerciseRecord } from '@/lib/appwrite';

type Exercise = {
  $id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
};

const ListScreen = () => {
  const { id: userId, selectedDate, userName } = useLocalSearchParams<{
    id: string;
    selectedDate: string;
    userName: string;
  }>();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [series, setSeries] = useState('');
  const [reps, setReps] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('Parâmetros recebidos:', { userId, selectedDate }); // Debug

    const loadExercises = async () => {
      try {
        setLoading(true);
        const result = await getAllExercises();
        
        const mappedExercises = result.documents.map(doc => ({
          $id: doc.$id,
          nome: doc.nome,
          descricao: doc.descricao,
          categoria: doc.categoria
        }));
        
        setExercises(mappedExercises);
      } catch (err) {
        console.error('Erro ao carregar exercícios:', err);
        setError('Erro ao carregar exercícios');
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const handleAddExercise = async () => {
    if (!selectedExercise || !series || !reps) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      const userIdStr = Array.isArray(userId) ? userId[0] : userId;
      const dateStr = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate;

      if (!userIdStr) {
        throw new Error("ID do usuário não está definido");
      }

      console.log('Criando treino para:', { userIdStr, dateStr }); // Debug
      
      // 1. Criar registro na coleção treinoGinasio
      const workoutId = await createWorkoutSession(userIdStr, dateStr);
      
      // 2. Criar registro na coleção registoTreinoCollection
      await createExerciseRecord(
        selectedExercise.$id,
        workoutId,
        parseInt(series),
        parseInt(reps)
      );
      
      Alert.alert('Sucesso', 'Exercício adicionado com sucesso!');
      setModalVisible(false);
      setSeries('');
      setReps('');
      
      // Navegar de volta com parâmetros atualizados
      router.navigate({
        pathname: '/_backend_ginasio/profile_plan/[id]',
        params: { 
          id: userIdStr,
          selectedDate: dateStr,
          userName: Array.isArray(userName) ? userName[0] : userName,
          refresh: Date.now().toString()
        }
      });
    } catch (error) {
      console.error('Erro ao adicionar exercício:', error);
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível adicionar o exercício');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSeries('');
    setReps('');
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
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atribuir Exercício</Text>
      <Text style={styles.subtitle}>
        Para {Array.isArray(userName) ? userName[0] : userName} em {' '}
        {selectedDate ? new Date(Array.isArray(selectedDate) ? selectedDate[0] : selectedDate).toLocaleDateString('pt-PT') : 'Data não especificada'}
      </Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.exerciseCard}
            onPress={() => handleSelectExercise(item)}
          >
            <Text style={styles.exerciseName}>{item.nome}</Text>
            {item.descricao && <Text style={styles.exerciseDescription}>{item.descricao}</Text>}
            {item.categoria && <Text style={styles.exerciseCategory}>{item.categoria}</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum exercício disponível</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar {selectedExercise?.nome}</Text>
            
            <Text style={styles.inputLabel}>Séries</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ex: 3"
              value={series}
              onChangeText={setSeries}
            />
            
            <Text style={styles.inputLabel}>Repetições</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ex: 12"
              value={reps}
              onChangeText={setReps}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddExercise}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 50,
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
  exerciseDescription: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 5,
  },
  exerciseCategory: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ListScreen;