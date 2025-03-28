import { View, Text, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { config, getTesteById, getAccount, signOut, deleteTesteInicial } from '@/lib/appwrite';

export default function TesteInicialDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [teste, setTeste] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificação de sessão e carregamento dos dados
  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Verificar sessão
        const session = await getAccount();
        if (!session) {
          await signOut();
          router.replace('/(auth)/sign-in');
          return;
        }

        // 2. Verificar se o ID existe
        if (!id || typeof id !== 'string') {
          throw new Error('ID do teste inválido');
        }

        // 3. Carregar dados do teste
        console.log('Buscando teste com ID:', id); // Debug
        const testData = await getTesteById(id);
        
        if (!testData) {
          throw new Error('Teste não encontrado no banco de dados');
        }

        setTeste(testData);
      } catch (err) {
        console.error('Erro ao carregar:', err);
        setError(err.message);
        Alert.alert('Erro', err.message);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [id]);

  
  const handleDelete = async () => {
    console.log('ID do teste antes da exclusão:', id); // Verifica se o ID está correto
    try {
      const user = await client.account.get();  // Função do Appwrite para obter o utilizador autenticado
      if (!user) {
        console.log("Nenhum utilizador autenticado!");
        return;  // Não permite a exclusão se não houver utilizador autenticado
      }
      console.log("Utilizador atual:", user);
        await deleteTesteInicial(id);
        console.log('Teste eliminado com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir:', error);
    }
};  
  // Renderização condicional
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error || !teste) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{error || 'Teste não encontrado'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
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
        style={[styles.deleteButton, loading && styles.disabledButton]}
        onPress={handleDelete}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.deleteText}>Excluir Teste</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
  style={[styles.editButton, loading && styles.disabledButton]}
  onPress={() => router.push(`/_backend_teste_inicial/teste_inicial_details/edit/${id}`)}
  disabled={loading}
>
  <Text style={styles.editButtonText}>Editar Teste</Text>
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
  disabledButton: {
    opacity: 0.6,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#fff',
  }
});