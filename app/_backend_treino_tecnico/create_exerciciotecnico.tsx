import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { createExercicioTecnico } from '@/lib/appwrite';

/**
 * Tela para criar um Exercício Técnico.
 * Campos: Nome, Vídeo (URL válida), Instruções e Desporto.
 */
export default function CreateExercicioTecnico() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [video, setVideo] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [desporto, setDesporto] = useState<string | null>(null);
  const [openDesporto, setOpenDesporto] = useState(false);
  const [loading, setLoading] = useState(false);

  const desportoOptions = [
    { label: 'Rugby', value: 'Rugby' },
    { label: 'Futebol', value: 'Futebol' }
  ];

  const normalizeVideoUrl = (url: string): string | null => {
    try {
      const parsed = new URL(url.trim());
      // Se for link padrão do YouTube, converte para "youtu.be"
      if (parsed.hostname.includes('youtube.com') && parsed.searchParams.has('v')) {
        return `https://youtu.be/${parsed.searchParams.get('v')}`;
      }
      // Outras URLs mantêm-se
      return parsed.toString();
    } catch {
      return null;
    }
  };

  const handleCreate = async () => {
    const normalized = normalizeVideoUrl(video);
    if (!nome.trim() || !video.trim() || !instrucoes.trim() || !desporto) {
      Alert.alert('Erro', 'Por favor preencha todos os campos.');
      return;
    }
    if (!normalized) {
      Alert.alert('Erro', 'URL de vídeo inválida.');
      return;
    }

    setLoading(true);
    try {
      await createExercicioTecnico(nome.trim(), normalized, instrucoes.trim(), desporto);
      Alert.alert('Sucesso', 'Exercício técnico criado com sucesso!');
      router.replace('/_backend_treino_tecnico/treinos_tecnicos');
    } catch (error) {
      console.error('Erro ao criar exercício técnico:', error);
      Alert.alert('Erro', 'Não foi possível criar o exercício técnico.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do Exercício Técnico</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite o nome"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Link do Vídeo</Text>
      <TextInput
        style={styles.input}
        value={video}
        onChangeText={setVideo}
        placeholder="Digite a URL do vídeo"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="url"
      />

      <Text style={styles.label}>Instruções</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={instrucoes}
        onChangeText={setInstrucoes}
        placeholder="Digite as instruções"
        placeholderTextColor="#888"
        multiline
      />

      <Text style={styles.label}>Desporto</Text>
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
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'A criar...' : 'Salvar Exercício Técnico'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

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
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    padding: 12,
    borderRadius: 8,
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
  buttonDisabled: {
    backgroundColor: '#777',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
