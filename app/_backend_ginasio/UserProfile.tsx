import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { router } from 'expo-router';

const UserProfile = () => {
  const route = useRoute();
  const { id, nome, desporto, posicao, altura, peso } = route.params || {}; // Acessa os parâmetros passados

  // Estado para armazenar a data selecionada
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Função para obter as datas da semana
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
  const today = new Date().toISOString().split('T')[0]; // Data de hoje

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    console.log("Aqui")
  };

  const markedDates: { [key: string]: { selected: boolean; selectedColor: string; selectedTextColor: string; marked: boolean; dotColor?: string } } = weekDates.reduce((acc, date) => {
    acc[date] = {
      selected: date === selectedDate,
      selectedColor: '#4CAF50',
      selectedTextColor: '#fff',
      marked: date === today,
      dotColor: date === today ? '#FF6347' : undefined,
    };
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled" // Importante!
      >        
      <View style={styles.header}>
          <Text style={styles.title}>Perfil de {nome ?? 'Desconhecido'}</Text>
        </View>

        <View style={styles.profileContainer}>
          {/* Foto de Perfil */}
          <View style={styles.profilePicContainer}>
            <Image
              source={require('../../assets/images/default-profile.jpg')} // Imagem padrão, caso não haja foto
              style={styles.profilePic}
            />
            <TouchableOpacity style={styles.changePicButton}>
              <Text style={styles.changePicText}>Alterar Foto</Text>
            </TouchableOpacity>
          </View>

          {/* Detalhes do Perfil */}
          <View style={styles.profileInfoSection}>
            <Text style={styles.profileTitle}>Detalhes do Perfil</Text>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileLabel}>Nome</Text>
              <Text style={styles.profileValue}>{nome || 'Não disponível'}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileLabel}>Desporto</Text>
              <Text style={styles.profileValue}>{desporto || 'Não disponível'}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileLabel}>Posição</Text>
              <Text style={styles.profileValue}>{posicao || 'Não disponível'}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileLabel}>Altura</Text>
              <Text style={styles.profileValue}>{altura || 'Não disponível'} cm</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileLabel}>Peso</Text>
              <Text style={styles.profileValue}>{peso || 'Não disponível'} kg</Text>
            </View>
          </View>
        </View>

        {/* Plano Semanal */}
        <SafeAreaView style={styles.planContainer}>
          <Text style={styles.header}>Plano Semanal</Text>
          <Calendar
            markedDates={markedDates}
            onDayPress={handleDayPress}
            monthFormat={'yyyy MM'}
            firstDay={1} // Segunda-feira como primeiro dia da semana
            hideExtraDays={true} // Esconde os dias do próximo mês
          />
          <View style={styles.selectedDayContainer}>
            <Text style={styles.selectedDayText}>Dia Selecionado: {selectedDate}</Text>
          </View>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
              console.log("ID do usuário antes da navegação:", id); // Adicione para debug
              router.push({
                pathname: "/_backend_ginasio/profile_plan/[id]",
                params: { 
                  id: id, // Garante que é string
                  selectedDate: String(selectedDate),
                  userName: String(nome)
                }
              });
            }}
          >
  <Text style={styles.buttonText}>Ver Plano do Dia</Text>
        </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  header: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 10,
  },
  changePicButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  changePicText: {
    color: '#fff',
    fontSize: 14,
  },
  profileInfoSection: {
    width: '100%',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  profileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  profileLabel: {
    fontSize: 16,
    color: '#aaa',
    fontWeight: '600',
  },
  profileValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '400',
  },
  planContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
  },
  selectedDayContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  selectedDayText: {
    fontSize: 18,
    color: '#fff',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20 // Espaço para o botão
  },
});

export default UserProfile;
