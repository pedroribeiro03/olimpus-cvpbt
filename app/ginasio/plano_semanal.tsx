import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TouchableOpacity, StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { getCurrentUser, generateTrainingPlan, generateTrainingPlan_Tecnico, hasGymPlansNext7Days, hasTechPlansNext7Days } from '@/lib/appwrite';

const PlanoSemanal = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(true);
  const [hasGymPlans, setHasGymPlans] = useState<boolean>(false);
  const [hasTechPlans, setHasTechPlans] = useState<boolean>(false);

  // Calcula datas da semana atual
  const getWeekDates = () => {
    const start = new Date();
    const day = start.getDay();
    const monday = new Date(start);
    monday.setDate(start.getDate() - day + 1);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // obtém usuário
    getCurrentUser().then(u => setUserId(u?.IDUtilizador || null));
  }, []);

  useEffect(() => {
    const validate = async () => {
      if (!userId) return;
      setValidating(true);
      try {
        setHasGymPlans(await hasGymPlansNext7Days());
        setHasTechPlans(await hasTechPlansNext7Days());
      } catch (e) {
        console.error(e);
      } finally {
        setValidating(false);
      }
    };
    validate();
  }, [userId]);

  const handleDayPress = (day: { dateString: string }) => setSelectedDate(day.dateString);

  const markedDates = weekDates.reduce((acc, date) => {
    acc[date] = {
      selected: date === selectedDate,
      selectedColor: '#4CAF50',
      selectedTextColor: '#fff',
      marked: date === today,
      dotColor: date === today ? '#FF6347' : undefined
    };
    return acc;
  }, {} as any);

  const handleGenerateGym = async () => {
    if (!userId) { Alert.alert('Erro','Usuário não encontrado'); return; }
    setLoading(true);
    try {
      await generateTrainingPlan(userId);
      Alert.alert('Sucesso','Plano de ginásio gerado!');
      setHasGymPlans(true);
    } catch {
      Alert.alert('Erro','Não foi possível gerar o plano de ginásio.');
    } finally { setLoading(false); }
  };

  const handleGenerateTech = async () => {
    if (!userId) { Alert.alert('Erro','Usuário não encontrado'); return; }
    setLoading(true);
    try {
      await generateTrainingPlan_Tecnico(userId);
      Alert.alert('Sucesso','Plano técnico gerado!');
      setHasTechPlans(true);
    } catch {
      Alert.alert('Erro','Não foi possível gerar o plano técnico.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Plano Semanal</Text>

      {(loading||validating) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>{validating?'Validando...':'A carregar...'}</Text>
        </View>
      )}

      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        monthFormat="yyyy MM"
        firstDay={1}
        hideExtraDays
      />

      <View style={styles.selectedDayContainer}>
        <Text style={styles.selectedDayText}>Dia Selecionado: {selectedDate}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`../ginasio/date/${selectedDate}`)}
      >
        <Text style={styles.buttonText}>Ver Plano do Dia</Text>
      </TouchableOpacity>

      {/* Botões condicionais */}
      {!validating && !hasGymPlans && (
        <TouchableOpacity style={styles.button} onPress={handleGenerateGym}>
          <Text style={styles.buttonText}>Gerar Plano de Ginásio</Text>
        </TouchableOpacity>
      )}
      {!validating && hasGymPlans && (
        <Text style={styles.infoText}>Já existe plano de ginásio para esta semana</Text>
      )}
      {!validating && !hasTechPlans && (
        <TouchableOpacity style={styles.button} onPress={handleGenerateTech}>
          <Text style={styles.buttonText}>Gerar Plano Técnico</Text>
        </TouchableOpacity>
      )}
      {!validating && hasTechPlans && (
        <Text style={styles.infoText}>Já existe plano técnico para esta semana</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#000', padding:16 },
  header: { fontSize:24,fontWeight:'bold',color:'#fff',marginBottom:20,textAlign:'center' },
  selectedDayContainer:{ marginTop:20,alignItems:'center',padding:10 },
  selectedDayText:{ color:'#fff',fontSize:16 },
  button:{ backgroundColor:'#4CAF50',padding:10,borderRadius:5,marginTop:20,alignItems:'center',width:'80%',alignSelf:'center' },
  buttonText:{ color:'#fff',fontSize:16 },
  loadingContainer:{ position:'absolute',top:'50%',left:'50%',transform:[{translateX:-100},{translateY:-100}],alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.7)',padding:20,borderRadius:10,width:'80%',height:'30%',zIndex:1 },
  loadingText:{ color:'#fff',marginTop:10,fontSize:18 },
  infoText:{ color:'#fff',textAlign:'center',marginTop:10 }
});

export default PlanoSemanal;
