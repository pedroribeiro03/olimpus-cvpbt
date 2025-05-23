import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router'; // Importando o useRouter
import { getTestesGinasio } from '@/lib/appwrite';

interface Teste {
  $id: string;
  nome: string;
}

const HomeTestesGinasio = () => {
  const [testes, setTestes] = useState<Teste[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Instanciando o useRouter

  useEffect(() => {
    const carregarTestes = async () => {
      try {
        setLoading(true);
        const documentos = await getTestesGinasio();
        
        const testesConvertidos = documentos.map((doc: any) => ({
          $id: doc.$id,
          nome: doc.nome
        })) as Teste[];
        
        setTestes(testesConvertidos);
      } catch (error) {
        console.error('Erro ao carregar testes:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarTestes();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ccc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Testes de Ginásio</Text>
      
      <FlatList
        data={testes}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.testCard}
            onPress={() =>
                      router.push({
                        pathname: '/ginasio/registo_resultado_teste/[id]',
                        params: { id: item.$id },
                      })
                    }          >
            <Text style={styles.testName}>{item.nome}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum teste de ginásio disponível</Text>
        }
      />
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
  emptyText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomeTestesGinasio;