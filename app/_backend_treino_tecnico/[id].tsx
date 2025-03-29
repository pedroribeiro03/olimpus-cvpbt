import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTreinoTecnicoById, deleteTreinoTecnico } from '@/lib/appwrite';
import { FontAwesome } from '@expo/vector-icons';

const TreinoTecnicoDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [treino, setTreino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTreino = async () => {
      try {
        setLoading(true);
        const data = await getTreinoTecnicoById(id.toString());
        setTreino(data);
      } catch (err) {
        console.error('Erro ao carregar treino:', err);
        setError(err.message || 'Erro ao carregar o treino técnico');
      } finally {
        setLoading(false);
      }
    };

    loadTreino();
  }, [id]);

  const handleVoltar = () => {
    router.push('/(tabs_backend)/treinos_tecnicos');
  };

  const handleEditar = () => {
    router.push({
      pathname: '/_backend_treino_tecnico/edit/[id]',
      params: { id: id.toString() }
    });
  };

  const handleEliminar = async () => {
    try {
      // Mostra o alerta de confirmação
      Alert.alert(
        'Confirmar eliminação',
        'Tem certeza que deseja eliminar este treino técnico?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => console.log('Cancelado pelo usuário')
          },
          { 
            text: 'Eliminar', 
            onPress: async () => {
              try {
                setLoading(true);
                await deleteTreinoTecnico(id.toString());
                
                // Feedback visual
                Alert.alert('Sucesso', 'Treino técnico eliminado com sucesso!');
                
                // Redireciona após 1 segundo para dar tempo do alerta ser visto
                setTimeout(() => {
                  router.replace('/(tabs_backend)/treinos_tecnicos');
                }, 1000);
                
              } catch (error) {
                Alert.alert('Erro', error.message || 'Não foi possível eliminar o treino técnico');
              } finally {
                setLoading(false);
              }
            },
            style: 'destructive'
          }
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Erro no handler de eliminação:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleVoltar}>
          <Text style={styles.backButtonText}>Voltar para a lista</Text>
        </TouchableOpacity>
        <Text style={styles.hintText}>Verifique sua conexão com a internet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header sem espaços entre componentes */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleVoltar}>
          <FontAwesome name="arrow-left" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{treino?.nome || 'Treino sem nome'}</Text>
        </View>
        <View style={styles.emptySpace} />
      </View>

      {/* Conteúdo sem espaços entre componentes */}
      <View style={styles.content}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Sequência:</Text>
          <Text style={styles.text}>{treino?.sequencia || 'Nenhuma sequência definida'}</Text>
        </View>
        {treino?.video ? (
          <View style={styles.detailItem}>
            <Text style={styles.label}>Vídeo:</Text>
            <Text style={styles.text}>{treino.video}</Text>
          </View>
        ) : null}
      </View>

      {/* Botões sem espaços entre componentes */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleEditar}>
          <Text style={styles.buttonText}>Editar Treino</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleEliminar}>
          <Text style={styles.buttonText}>Eliminar Treino</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptySpace: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  detailItem: {
    marginBottom: 15,
  },
  label: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    color: '#fff',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  hintText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  backButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TreinoTecnicoDetails;