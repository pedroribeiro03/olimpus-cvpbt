import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { getCurrentUser, getMealSuggestionFromDatabase, generateAndSaveMealSuggestion } from '@/lib/appwrite'; // Funções para API
import Collapsible from 'react-native-collapsible';  // Componente para exibir conteúdo em colapso

const todayDate = new Date().toISOString().split('T')[0];  // Data de hoje no formato YYYY-MM-DD

const RefeicoesScreen = () => {
  const [userId, setUserId] = useState<string | null>(null);  // Armazenando o ID do usuário
  const [loading, setLoading] = useState(false);  // Estado de carregamento
  const [mealSuggestion, setMealSuggestion] = useState<{ [key: string]: string | null }>({
    'Pequeno-Almoço': null,
    'Almoço': null,
    'Jantar': null,
    'Snacks': null,
  }); // Agora armazenamos as sugestões de cada refeição separadamente
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({
    'Pequeno-Almoço': true,
    'Almoço': true,
    'Jantar': true,
    'Snacks': true,
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUserId(currentUser.IDUtilizador); // Defina o ID do usuário logado
        } else {
          console.log("Usuário não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao obter usuário:", error);
      }
    };

    fetchUserId();
  }, []); // useEffect para rodar apenas uma vez ao carregar o componente

  // Função para lidar com os cliques dos botões e gerar sugestões de refeição
  const handleMealButtonClick = async (mealType: string) => {
    try {
      setLoading(true);  // Inicia o carregamento

      // Verificar se já há uma refeição registrada na base de dados
      const storedMealSuggestion = await getMealSuggestionFromDatabase(userId, mealType);

      if (storedMealSuggestion) {
        // Se já houver sugestão salva, exibe a refeição registrada
        setMealSuggestion((prevSuggestions) => ({
          ...prevSuggestions,
          [mealType]: storedMealSuggestion,
        }));
        // Expandir o toggle automaticamente
        setCollapsed((prevState) => ({
          ...prevState,
          [mealType]: false,  // Expande o toggle quando a refeição for recuperada
        }));
      } else {
        // Caso contrário, gera e salva a sugestão usando GPT
        await generateAndSaveMealSuggestion(userId, mealType);
        const newMealSuggestion = await getMealSuggestionFromDatabase(userId, mealType); // Obter novamente após salvar
        setMealSuggestion((prevSuggestions) => ({
          ...prevSuggestions,
          [mealType]: newMealSuggestion,
        }));
        // Expandir o toggle automaticamente
        setCollapsed((prevState) => ({
          ...prevState,
          [mealType]: false,  // Expande o toggle assim que a refeição for gerada
        }));
      }

      setLoading(false);  // Finaliza o carregamento
    } catch (error) {
      console.error("Erro ao gerar e salvar sugestão de refeição:", error);
      setLoading(false);  // Finaliza o carregamento
    }
  };

  // Função para alternar o estado de expansão dos botões (colapso ou expansão)
  const toggleCollapse = (mealType: string) => {
    setCollapsed((prevState) => ({
      ...prevState,
      [mealType]: !prevState[mealType],  // Alterna o estado de colapso/expansão
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Título */}
        <Text style={styles.header}>Sugestão de Refeições</Text>

        {/* Botões para as refeições */}
        <View style={styles.buttonsContainer}>
          {['Pequeno-Almoço', 'Almoço', 'Jantar', 'Snacks'].map((mealType) => (
            <View key={mealType} style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  toggleCollapse(mealType);  // Alterna o estado do toggle
                  if (collapsed[mealType]) {
                    handleMealButtonClick(mealType);  // Chama a função de gerar sugestão
                  }
                }}
              >
                <Text style={styles.buttonText}>{mealType}</Text>
              </TouchableOpacity>

              {/* Exibição da sugestão com efeito de deslizamento */}
              <Collapsible collapsed={collapsed[mealType]}>
                <View style={styles.suggestionContainer}>
                  {loading && (
                    <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />
                  )}

                  {mealSuggestion[mealType] && (
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionText}>{mealSuggestion[mealType]}</Text>  {/* Exibe o texto da refeição diretamente */}
                    </View>
                  )}
                </View>
              </Collapsible>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  scrollContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonContainer: {
    width: '80%',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  loading: {
    marginTop: 20,
  },
  suggestionContainer: {
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  suggestionContent: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default RefeicoesScreen;
