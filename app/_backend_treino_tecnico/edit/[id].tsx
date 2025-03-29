import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { getTreinoTecnicoById, updateTreinoTecnico, getAllTreinos } from '@/lib/appwrite';

export default function EditTreinoTecnico() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [treino, setTreino] = useState(null);
  const [nome, setNome] = useState('');
  const [video, setVideo] = useState('');
  const [sequencia, setSequencia] = useState('');
  const [treinoId, setTreinoId] = useState('');
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [treinoData, treinosData] = await Promise.all([
          getTreinoTecnicoById(id),
          getAllTreinos()
        ]);

        setTreino(treinoData);
        setNome(treinoData.nome);
        setVideo(treinoData.video);
        setSequencia(treinoData.sequencia);
        setTreinoId(treinoData.treino_id || '');
        setTreinos(treinosData.documents);
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar dados do treino');
        console.error(error);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    if (!nome || !video || !sequencia) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setSubmitting(true);
    try {
      await updateTreinoTecnico(id, {
        nome,
        video,
        sequencia,
        treino_id: treinoId || null
      });
      Alert.alert('Sucesso', 'Treino técnico atualizado com sucesso');
      router.replace('/(tabs_backend)/treinos_tecnicos');
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao atualizar treino técnico');
    } finally {
      setSubmitting(false);
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
      <Text style={styles.title}>Editar Treino Técnico</Text>

      <Text style={styles.label}>Nome*</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome do treino técnico"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>URL do Vídeo*</Text>
      <TextInput
        style={styles.input}
        value={video}
        onChangeText={setVideo}
        placeholder="https://exemplo.com/video"
        placeholderTextColor="#aaa"
        keyboardType="url"
      />

      <Text style={styles.label}>Sequência*</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={sequencia}
        onChangeText={setSequencia}
        placeholder="Descreva a sequência do treino"
        placeholderTextColor="#aaa"
        multiline
      />

      <Text style={styles.label}>Treino Relacionado (Opcional)</Text>
      <View style={styles.dropdownContainer}>
        {treinos.map(t => (
          <TouchableOpacity
            key={t.$id}
            style={[
              styles.dropdownItem,
              treinoId === t.$id && styles.selectedItem
            ]}
            onPress={() => setTreinoId(t.$id)}
          >
            <Text style={styles.dropdownItemText}>{t.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, submitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar Alterações</Text>
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
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownItem: {
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#444',
  },
  selectedItem: {
    backgroundColor: '#4CAF50',
  },
  dropdownItemText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#2a5c2a',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});