import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';

const Home = () => {
  const { user } = useGlobalContext();

  const goToPlano = () => {
    router.push('../ginasio/plano_semanal');
  };

  const goToTestes = () => {
    router.push('../ginasio/home_testesiniciais');
  };

  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          {/* Cabeçalho com logo */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Image source={require('../../assets/images/Logo_sf.png')} style={styles.logo} />
            </View>
          </View>

          {/* Conteúdo principal */}
          <View style={styles.content}>
            <Text style={styles.welcomeText}>Bem-vindo</Text>
            <Text style={styles.nameText}>{user.username || 'Não disponível'}</Text>
            
            {/* Botão Consultar Plano Semanal */}
            <TouchableOpacity
              style={styles.planoButton}
              onPress={goToPlano}
            >
              <Text style={styles.buttonText}>
                Consultar plano semanal
              </Text>
            </TouchableOpacity>

            {/* Botão Atualizar Testes */}
            <TouchableOpacity
              style={[styles.planoButton, styles.testesButton]}
              onPress={goToTestes}
            >
              <Text style={styles.buttonText}>
                Atualizar Testes
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  nameText: {
    marginLeft: 20,
    alignSelf: 'flex-start',
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeText: {
    marginLeft: 20,
    alignSelf: 'flex-start',
    color: '#CCC',
    fontSize: 18,
    marginBottom: 30,
  },
  planoButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15, // Espaçamento entre os botões
  },
  testesButton: {
    backgroundColor: '#2196F3', // Azul para diferenciar
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;