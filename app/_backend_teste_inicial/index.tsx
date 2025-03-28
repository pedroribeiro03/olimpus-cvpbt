import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { getTestesCampo, getTestesGinasio } from '@/lib/appwrite';

type Teste = {
  $id: string;
  nome: string;
  tipoTeste: string;
};

const TestesIniciais = () => {
    const router = useRouter();
    const [testes, setTestes] = useState<Teste[]>([]);
    const [loading, setLoading] = useState(true);
    const [tipoTeste, setTipoTeste] = useState<'campo'|'ginasio'>('campo');
    const [page, setPage] = useState(1);
    const limit = 10;
  
    const fetchTestes = async () => {
      try {
        setLoading(true);
        const offset = (page - 1) * limit;
        const response = tipoTeste === 'campo' 
          ? await getTestesCampo(limit, offset) 
          : await getTestesGinasio(limit, offset);
        
        setTestes(response.documents.map(doc => ({
          $id: doc.$id,
          nome: doc.nome,
          tipo: tipoTeste
        })));
      } catch (error) {
        console.error('Erro ao obter testes:', error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchTestes();
    }, [tipoTeste, page]);
  
    const navigateToCreate = () => {
      router.push('/_backend_teste_inicial/create_testeinicial');
    };
  
    const navigateToDetails = (id: string) => {
      router.push({
        pathname: '/_backend_teste_inicial/testesinicial_details/[id]',
        params: { id }
      });
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
        <Text style={styles.title}>Testes Iniciais</Text>
  
        {/* Seletor de Tipo */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              tipoTeste === 'campo' && styles.activeTab
            ]}
            onPress={() => {
              setTipoTeste('campo');
              setPage(1);
            }}
          >
            <Text style={styles.tabText}>Testes de Campo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              tipoTeste === 'ginasio' && styles.activeTab
            ]}
            onPress={() => {
              setTipoTeste('ginasio');
              setPage(1);
            }}
          >
            <Text style={styles.tabText}>Testes de Ginásio</Text>
          </TouchableOpacity>
        </View>
  
        {/* Botão de Criação */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={navigateToCreate}
        >
          <Text style={styles.createButtonText}>Criar Novo Teste</Text>
        </TouchableOpacity>
  
        {/* Lista de Testes */}
        <FlatList
          data={testes}
          keyExtractor={item => item.$id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.testCard}
              onPress={() => navigateToDetails(item.$id)}
            >
              <Text style={styles.testName}>{item.nome}</Text>
              <Text style={styles.testType}>
                Tipo: {item.tipo === 'campo' ? 'Campo' : 'Ginásio'}
              </Text>
            </TouchableOpacity>
          )}
        />
  
        {/* Paginação (opcional) */}
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              page === 1 && styles.paginationButtonDisabled
            ]}
            onPress={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <Text style={styles.paginationButtonText}>Anterior</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.paginationButton}
            onPress={() => setPage(p => p + 1)}
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
  });

export default TestesIniciais;