import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { getCurrentUser } from '@/lib/appwrite';
import { generateTrainingPlan } from '@/lib/appwrite';

const PlanoSemanal = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [userId, setUserId] = useState<string | null>(null);  // Armazenando o ID do usuário
  const [loading, setLoading] = useState(false);  // Estado de carregamento

  // Função para obter o formato da data (YYYY-MM-DD) da semana atual
  const getWeekDates = () => {
    const startOfWeek = new Date();
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + 1); // Ajusta para a segunda-feira da semana atual

    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]); // Data no formato YYYY-MM-DD
    }

    return weekDates;
  };

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
  }, []);  // O useEffect será executado quando o componente for montado

  const weekDates = getWeekDates();
  const today = new Date().toISOString().split('T')[0];

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    console.log(`Você selecionou o dia: ${day.dateString}`);
  };

  const markedDates: { [key: string]: { selected: boolean; selectedColor: string; selectedTextColor: string; marked: boolean; dotColor?: string } } = 
  weekDates.reduce<{ [key: string]: { selected: boolean; selectedColor: string; selectedTextColor: string; marked: boolean; dotColor?: string } }>( 
    (acc, date) => {
      acc[date] = {
        selected: date === selectedDate,
        selectedColor: '#4CAF50',
        selectedTextColor: '#fff',
        marked: date === today,
        dotColor: date === today ? '#FF6347' : undefined,
      };
      return acc;
    },
    {} // Iniciando o acumulador como um objeto vazio
  );

  // Função para gerar o plano de treino
  const handleGenerateTrainingPlan = async () => {
    try {
      if (!userId) {
        Alert.alert("Erro", "Usuário não encontrado.");
        return;
      }

      setLoading(true);  // Inicia o carregamento

      // Agora, podemos gerar o plano de treino
      await generateTrainingPlan(userId);  // Chama a função de geração do plano de treino do appwrite.js

      setLoading(false);  // Finaliza o carregamento
      Alert.alert('Plano de treino gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar plano de treino:', error);
      setLoading(false);  // Finaliza o carregamento
      Alert.alert('Erro', 'Não foi possível gerar o plano de treino.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Plano Semanal</Text>

      {/* Mostrar a mensagem de carregamento se estiver carregando */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>A carregar plano...</Text>
        </View>
      )}

      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        monthFormat={'yyyy MM'}
        firstDay={1} // Segunda-feira como primeiro dia da semana
        hideExtraDays={true} // Esconde os dias do próximo mês
      />

      {/* Exibe o dia selecionado */}
      <View style={styles.selectedDayContainer}>
        <Text style={styles.selectedDayText}>Dia Selecionado: {selectedDate}</Text>
      </View>

      {/* Botão para visualizar o plano do dia */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          router.push(`../ginasio/date/${selectedDate}`);
        }}
      >
        <Text style={styles.buttonText}>Ver Plano do Dia</Text>
      </TouchableOpacity>

      {/* Botão para gerar plano de treino */}
      <TouchableOpacity style={styles.button} onPress={handleGenerateTrainingPlan}>
        <Text style={styles.buttonText}>Gerar Plano de Treino</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedDayContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
  },
  selectedDayText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
loadingContainer: {
  position: 'absolute',
  top: '50%',    // Coloca a sobreposição no meio da tela verticalmente
  left: '50%',   // Coloca a sobreposição no meio da tela horizontalmente
  transform: [{ translateX: -100 }, { translateY: -100 }], // Ajusta para o centro
  alignItems: 'center',  // Alinha o conteúdo no centro horizontalmente
  justifyContent: 'center', // Alinha o conteúdo no centro verticalmente
  backgroundColor: 'rgba(0,0,0,0.7)',  // Cor de fundo com opacidade
  padding: 20,
  borderRadius: 10,
  width: '80%',  // Controla a largura
  height: '30%',  // Controla a altura
  zIndex: 1,  // Garante que fique acima de outros elementos
},


  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 18,
  },
});

export default PlanoSemanal;
