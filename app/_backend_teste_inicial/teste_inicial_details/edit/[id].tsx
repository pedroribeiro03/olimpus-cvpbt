import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getTesteById, updateTesteInicial, getAptidoes, getAccount, signOut } from '@/lib/appwrite';

export default function EditTesteInicial() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    instrucoes: '',
    tipoTeste: '',
    exercicioGinasioId: ''
  });
  const [aptidoes, setAptidoes] = useState([]);
  const [exercicios, setExercicios] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Verificar sessão
        const session = await getAccount();
        if (!session) {
          await signOut();
          router.replace('/(auth)/sign-in');
          return;
        }

        // Carregar dados do teste
        const teste = await getTesteById(id);
        if (!teste) throw new Error('Teste não encontrado');

        // Carregar opções para os dropdowns
        const [aptidoesData] = await Promise.all([
          getAptidoes()
        ]);

        setFormData({
          nome: teste.nome,
          instrucoes: teste.instrucoes,
          tipoTeste: teste.tipoTeste || '',
          exercicioGinasioId: teste.exercicioGinasio_id?.$id || ''
        });

        setAptidoes(aptidoesData.map(a => ({ label: a.nome, value: a.$id })));
        
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os dados do teste');
        console.error(error);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Verificar sessão
      const session = await getAccount();
      if (!session) {
        await signOut();
        router.replace('/(auth)/sign-in');
        return;
      }
  
      await updateTesteInicial(id, {
        nome: formData.nome,
        instrucoes: formData.instrucoes,
        tipoTesteId: formData.tipoTeste,
        exercicioGinasioId: formData.exercicioGinasioId
      });
  
      // Redireciona imediatamente após a atualização
      router.replace('/(tabs_backend)/testesiniciais');
  
    } catch (error) {
      Alert.alert('Erro', error.message || 'Falha ao atualizar teste');
      console.error(error);
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
      <Text style={styles.title}>Editar Teste</Text>

      <Text style={styles.label}>Nome*</Text>
      <TextInput
        style={styles.input}
        value={formData.nome}
        onChangeText={(text) => setFormData({...formData, nome: text})}
        placeholder="Nome do teste"
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Instruções*</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={formData.instrucoes}
        onChangeText={(text) => setFormData({...formData, instrucoes: text})}
        placeholder="Instruções do teste"
        placeholderTextColor="#aaa"
        multiline
      />

      <Text style={styles.label}>Tipo de Teste</Text>
      {/* Implemente o dropdown para selecionar o tipo de teste */}

      <Text style={styles.label}>Exercício Relacionado (Opcional)</Text>
      {/* Implemente o dropdown para selecionar exercício */}

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