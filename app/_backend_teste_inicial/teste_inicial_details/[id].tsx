// Importações corrigidas
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  Alert, 
  TouchableOpacity 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  config, 
  getTesteById, 
  getAccount, 
  signOut, 
  deleteTesteInicial,
  databases // Adicione esta importação
} from '@/lib/appwrite';
import { Query } from 'react-native-appwrite'; // Importe o Query separadamente
export default function TesteInicialDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [teste, setTeste] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificação de sessão e carregamento dos dados
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Carregando dados do teste...');
        
        // 1. Verificar autenticação
        const account = await getAccount();
        if (!account) {
          throw new Error('Usuário não autenticado');
        }
  
        // 2. Verificar se é backend user (opcional)
        const isBackendUser = await databases.listDocuments(
          config.databaseId,
          config.user_backEndCollectionId,
          [Query.equal('IDUtilizador', account.$id)]
        );
  
        // 3. Carregar dados do teste
        if (id && typeof id === 'string') {
          const testeData = await getTesteById(id);
          setTeste(testeData);
        } else {
          throw new Error('ID inválido');
        }
  
      } catch (error) {
        console.error('Erro ao carregar:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, 
  [id]);

  const handleDelete = async () => {
    console.log('[1] Iniciando processo de deleção');
    
    try {
      // 1. Diálogo de confirmação simplificado
      const userConfirmed = confirm('Tem certeza que deseja excluir este teste?');
      console.log('[2] Usuário respondeu:', userConfirmed);
      
      if (!userConfirmed) {
        console.log('[3] Operação cancelada pelo usuário');
        return;
      }
  
      // 2. Feedback visual
      Alert.alert('PROCESSANDO', 'Excluindo teste...');
      
      // 3. Execução direta sem timeout adicional
      console.log('[3] Executando deleção...');
      await deleteTesteInicial(id as string);
      
      console.log('[4] Deleção concluída');
      Alert.alert('SUCESSO', 'Teste excluído com sucesso!');
      router.replace('/(tabs_backend)/testesiniciais');
  
    } catch (error) {
      console.error('[ERRO] Detalhes:', {
        message: error.message,
        code: error.code,
        type: error.type
      });
      Alert.alert('ERRO', error.message || 'Falha ao excluir');
    }
  };
  // Renderização condicional
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{color: '#fff', marginTop: 10}}>
          {!teste ? 'Carregando teste...' : 'Processando...'}
        </Text>
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