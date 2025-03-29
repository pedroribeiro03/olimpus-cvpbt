import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { createTreinoTecnico, getAllTreinos } from '@/lib/appwrite';

export default function CreateTreinoTecnico() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: '',
    video: '',
    sequencia: '',
    treino_id: null
  });
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTreinos = async () => {
      try {
        const response = await getAllTreinos();
        setTreinos(response.documents);
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar treinos disponíveis');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTreinos();
  }, []);

  const handleSubmit = async () => {
    if (!form.nome || !form.video || !form.sequencia) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setSubmitting(true);
    try {
      // Garante que treino_id seja enviado como string ou null
      const treinoId = form.treino_id ? form.treino_id.$id : null;
      
      console.log("Dados sendo enviados:", {
        nome: form.nome,
        video: form.video,
        sequencia: form.sequencia,
        treino_id: treinoId
      });

      await createTreinoTecnico({
        nome: form.nome,
        video: form.video,
        sequencia: form.sequencia,
        treino_id: treinoId
      });

      Alert.alert('Sucesso', 'Treino técnico criado com sucesso!');
      router.replace('/(tabs_backend)/treinos_tecnicos');
    } catch (error) {
      console.error("Erro detalhado:", error);
      Alert.alert('Erro', error.message || 'Falha ao criar treino técnico');
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
      <Text style={styles.title}>Novo Treino Técnico</Text>

      <Text style={styles.label}>Nome*</Text>
      <TextInput
        style={styles.input}
        value={form.nome}
        onChangeText={(text) => setForm({...form, nome: text})}
        placeholder="Nome do treino técnico"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>URL do Vídeo*</Text>
      <TextInput
        style={styles.input}
        value={form.video}
        onChangeText={(text) => setForm({...form, video: text})}
        placeholder="https://exemplo.com/video"
        placeholderTextColor="#aaa"
        keyboardType="url"
      />

      <Text style={styles.label}>Sequência*</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        value={form.sequencia}
        onChangeText={(text) => setForm({...form, sequencia: text})}
        placeholder="Descreva a sequência completa do treino"
        placeholderTextColor="#aaa"
        multiline
      />

      <Text style={styles.label}>Treino Relacionado (Opcional)</Text>
      <View style={styles.dropdownContainer}>
        {treinos.map(treino => (
          <TouchableOpacity
            key={treino.$id}
            style={[
              styles.dropdownItem,
              form.treino_id?.$id === treino.$id && styles.selectedItem
            ]}
            onPress={() => setForm({...form, treino_id: treino})}
          >
            <Text style={styles.dropdownItemText}>{treino.nome}</Text>
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
          <Text style={styles.buttonText}>Criar Treino Técnico</Text>
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