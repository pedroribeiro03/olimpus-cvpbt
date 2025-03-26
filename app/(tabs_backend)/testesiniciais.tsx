import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { getAllTestesIniciais } from '@/lib/appwrite';
import { config } from '@/lib/appwrite';

type Teste = {
  $id: string;
  nome: string;
  tipoTeste: string;
};

const TestesIniciais = () => {
  const router = useRouter();
  const [testes, setTestes] = useState<Teste[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 25;

  const fetchTestes = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await getAllTestesIniciais(limit, offset);
      
      // Verificação segura da resposta
      if (!response || !response.documents) {
        throw new Error('Resposta da API inválida');
      }

      setTestes(response.documents.map(doc => ({
        $id: doc.$id,
        nome: doc.nome || 'Teste sem nome',
        tipoTeste: doc.tipoTeste === config.aptidaoCollectionId ? 'Ginásio' : 'Campo'
      })));

    } catch (error) {
      console.error('Erro ao obter testes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestes();
  }, [page]);

  const handleCreate = () => {
    router.push('/_backend_teste_inicial/create_testeinicial');
  };
  const handleDetails = (id: string) => {
    router.push({
      pathname: '/teste_inicial_details/[id]',
      params: { id }
    });
  };
  const handleNextPage = () => setPage(p => p + 1);
  const handlePrevPage = () => setPage(p => Math.max(p - 1, 1));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Testes Iniciais (Página {page})</Text>

      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>Criar Teste</Text>
      </TouchableOpacity>

      <FlatList
        data={testes}
        keyExtractor={item => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.testCard}
            onPress={() => handleDetails(item.$id)} // Use handleDetails aqui
          >
            <Text style={styles.testName}>{item.nome}</Text>
            <Text style={styles.testType}>Tipo: {item.tipoTeste}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
          onPress={handlePrevPage}
          disabled={page === 1}
        >
          <Text style={styles.paginationButtonText}>Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.paginationButton}
          onPress={handleNextPage}
        >
          <Text style={styles.paginationButtonText}>Próximo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#fff',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  testCard: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
  },
  testName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  testType: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  paginationButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  paginationButtonDisabled: {
    backgroundColor: '#2a2a2a',
  },
  paginationButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TestesIniciais;