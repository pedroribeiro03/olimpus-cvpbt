import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { createTreinoTecnico, getAllTreinos } from '@/lib/appwrite';

const CreateTreinoTecnico = () => {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [sequencia, setSequencia] = useState('');
  const [video, setVideo] = useState('');
  const [treinoRelacionado, setTreinoRelacionado] = useState(null);
  const [treinos, setTreinos] = useState<{label: string, value: string}[]>([]);
  const [openTreino, setOpenTreino] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTreinos = async () => {
      try {
        setLoading(true);
        const treinosRes = await getAllTreinos();
        
        setTreinos(treinosRes.documents.map(t => ({ 
          label: t.nome || 'Treino sem nome', 
          value: t.$id 
        })));
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar treinos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTreinos();
  }, []);

  const handleSubmit = async () => {
    if (!nome.trim() || !sequencia.trim() || !video.trim()) {
        Alert.alert('Erro', 'Nome, sequência e vídeo são obrigatórios');
        return;
    }

    try {
        setSubmitting(true);
        await createTreinoTecnico({
          nome,
          sequencia,
          video,
          treino_id: [treinoRelacionado], // Coloca treino_id dentro de um array
        });
        Alert.alert('Sucesso', 'Treino técnico criado com sucesso!');
        router.replace('/(tabs_backend)/treinos_tecnicos');
    } catch (error) {
        Alert.alert('Erro', error.message || 'Falha ao criar treino técnico');
        console.error(error);
    } finally {
        setSubmitting(false);
    }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Treino Técnico</Text>

      <Text style={styles.label}>Nome*</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome do treino técnico"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Sequência*</Text>
      <TextInput
        style={styles.input}
        value={sequencia}
        onChangeText={setSequencia}
        placeholder="Ex: 3x10 reps, 5 séries de 30s"
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

<Text style={styles.label}>Treino Relacionado (Opcional)</Text>
<DropDownPicker
  open={openTreino}
  value={treinoRelacionado || ""} // Garante que nunca é null
  items={treinos}
  setOpen={setOpenTreino}
  setValue={(callback) => {
    const selectedValue = callback(treinoRelacionado);
    console.log("Treino selecionado:", selectedValue); // Debug para verificar se está a funcionar
    setTreinoRelacionado(selectedValue);
  }}
  placeholder="Selecione um treino relacionado"
  style={styles.dropdown}
  dropDownContainerStyle={styles.dropdownContainer}
  zIndex={2000}
/>


      <TouchableOpacity
        style={[styles.button, submitting && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Salvando...' : 'Salvar Treino Técnico'}
        </Text>
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
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#fff',
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
  dropdown: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    borderRadius: 8,
    marginBottom: 15,
  },
  dropdownContainer: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
});

export default CreateTreinoTecnico;