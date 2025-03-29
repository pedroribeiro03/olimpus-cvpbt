import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getTreinoTecnicoById, deleteTreinoTecnico } from '@/lib/appwrite';

export default function TreinoTecnicoDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [treino, setTreino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTreinoTecnicoById(id);
        setTreino(data);
      } catch (error) {
        console.error("Failed to load technical training:", error);
        Alert.alert("Error", "Failed to load technical training details");
        router.back();
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteTreinoTecnico(id);
      Alert.alert('Sucesso', 'Treino excluído com sucesso');
      router.replace('/(tabs_backend)/treinos_tecnicos');
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{treino.nome}</Text>
      
      <Text style={styles.label}>Sequência:</Text>
      <Text style={styles.text}>{treino.sequencia}</Text>
      
      {treino.video && (
        <>
          <Text style={styles.label}>Vídeo:</Text>
          <Text style={styles.text}>{treino.video}</Text>
        </>
      )}

      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDelete}
        disabled={deleting}
      >
        {deleting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Excluir Treino</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#4CAF50',
    marginTop: 15,
    fontWeight: 'bold',
  },
  text: {
    color: '#fff',
    marginTop: 5,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});