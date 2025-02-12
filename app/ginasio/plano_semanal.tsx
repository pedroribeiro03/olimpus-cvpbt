import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';

const PlanoSemanal = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

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

  const weekDates = getWeekDates();
  const today = new Date().toISOString().split('T')[0];

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    // Aqui você pode adicionar lógica para carregar o plano de treino ou outra lógica
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


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Plano Semanal</Text>

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

      {/* Aqui você pode adicionar mais lógica, como carregar o plano do dia selecionado */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          // Redireciona para a página do plano do dia com o dia selecionado na URL
          router.push(`../ginasio/${selectedDate}`);
        }}
      >
        <Text style={styles.buttonText}>Ver Plano do Dia</Text>
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
    alignSelf: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PlanoSemanal;
