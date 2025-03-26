/*import { View, Text, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTesteById, deleteTesteInicial } from '@/lib/appwrite';

export default function TesteDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [teste, setTeste] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getTesteById(id);
        setTeste(data);
      } catch (error) {
        Alert.alert('Erro', 'Teste não encontrado');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{teste.nome}</Text>
      <Text style={styles.label}>Instruções:</Text>
      <Text style={styles.text}>{teste.instrucoes}</Text>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={async () => {
          await deleteTesteInicial(id);
          router.replace('/(tabs_backend)/testesiniciais');
        }}
      >
        <Text style={styles.deleteText}>Excluir Teste</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#1a1a1a' },
  title: { fontSize: 22, color: '#fff', fontWeight: 'bold', marginBottom: 20 },
  label: { color: '#4CAF50', marginTop: 15, fontWeight: 'bold' },
  text: { color: '#fff', marginTop: 5 },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40
  },
  deleteText: { color: '#fff', fontWeight: 'bold' }
});*/

import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTesteById, deleteTesteInicial } from '@/lib/appwrite';

export default function TesteInicialDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [teste, setTeste] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeste = async () => {
      try {
        const data = await getTesteById(id as string);
        setTeste(data);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar o teste');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchTeste();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteTesteInicial(id as string);
      Alert.alert('Sucesso', 'Teste excluído com sucesso');
      router.replace('/(tabs_backend)/testesiniciais');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao excluir teste');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!teste) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Teste não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{teste.nome}</Text>
      
      <Text style={styles.label}>Tipo de Teste:</Text>
      <Text style={styles.text}>
        {teste.tipoTeste === config.aptidaoCollectionId ? 'Ginásio' : 'Campo'}
      </Text>
      
      <Text style={styles.label}>Instruções:</Text>
      <Text style={styles.text}>{teste.instrucoes}</Text>

      {teste.exercicioGinasio_id && (
        <>
          <Text style={styles.label}>Exercício Relacionado:</Text>
          <Text style={styles.text}>{teste.exercicioGinasio_id.nome}</Text>
        </>
      )}

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <Text style={styles.deleteText}>Excluir Teste</Text>
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
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});