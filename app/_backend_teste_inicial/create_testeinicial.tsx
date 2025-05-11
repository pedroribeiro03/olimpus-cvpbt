import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { createTesteInicial, getAptidoes, getAllTestesIniciais } from '@/lib/appwrite';

const CreateTesteInicial = () => {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [tipoTeste, setTipoTeste] = useState(null);
  const [exercicioId, setExercicioId] = useState(null);
  const [aptidoes, setAptidoes] = useState<{label: string, value: string}[]>([]);
  const [exercicios, setExercicios] = useState<{label: string, value: string}[]>([]);
  const [openTipo, setOpenTipo] = useState(false);
  const [openExercicio, setOpenExercicio] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptidoesRes, exerciciosRes] = await Promise.all([
          getAptidoes(),
          getAllTestesIniciais()
        ]);

        setAptidoes(aptidoesRes.map(a => ({ 
          label: a.nome || 'Aptidão sem nome', 
          value: a.$id 
        })));

        setExercicios(exerciciosRes.documents.map(e => ({ 
          label: e.nome || 'Exercício sem nome', 
          value: e.$id 
        })));
      } catch (error) {
        Alert.alert('Erro', 'Falha ao carregar dados');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!nome.trim() || !instrucoes.trim()) {
      Alert.alert('Erro', 'Nome e instruções são obrigatórios');
      return;
    }

    setSubmitting(true);
    try {
      await createTesteInicial({nome,instrucoes, tipoTesteId: tipoTeste, exercicioGinasioId: exercicioId});
      Alert.alert('Sucesso', 'Teste criado com sucesso!');
      router.replace('/_backend_teste_inicial/testesiniciais');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar teste');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando opções...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Novo Teste Inicial</Text>

      <Text style={styles.label}>Nome*</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome do teste"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Instruções*</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={instrucoes}
        onChangeText={setInstrucoes}
        placeholder="Descreva as instruções do teste"
        placeholderTextColor="#aaa"
        multiline
      />

      <Text style={styles.label}>Tipo de Teste</Text>
      <DropDownPicker
        open={openTipo}
        value={tipoTeste}
        items={aptidoes}
        setOpen={setOpenTipo}
        setValue={setTipoTeste}
        placeholder="Selecione o tipo"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        zIndex={3000}
      />

      <Text style={styles.label}>Exercício Relacionado (Opcional)</Text>
      <DropDownPicker
        open={openExercicio}
        value={exercicioId}
        items={exercicios}
        setOpen={setOpenExercicio}
        setValue={setExercicioId}
        placeholder="Selecione um exercício"
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
          {submitting ? 'Salvando...' : 'Salvar Teste'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos permanecem os mesmos do exemplo anterior
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

export default CreateTesteInicial;