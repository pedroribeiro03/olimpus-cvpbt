import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';

const Home = () => {
  const{user} = useGlobalContext();

  const goToPlano = () => {
    router.push('../ginasio/plano_semanal');
  };

  if(user){
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      {/* Logo no topo */}
      <View style={styles.header}>
        <Image source={require('../../assets/images/Logo_sf.png')} style={styles.logo} />
      </View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Bem-vindo</Text>
        <Text style={styles.nameText}>{user.username || 'Não disponível'}</Text>
        <TouchableOpacity
            style={styles.planoButton}
            onPress={goToPlano}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
              Consultar plano semanal
            </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fundo preto
  },
  header: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#111', // Fundo ligeiramente mais claro no cabeçalho
    borderBottomWidth: 1,
    borderBottomColor: '#444', // Linha de separação discreta
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain', // Ajusta sem distorcer
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    marginLeft: 20,
    alignSelf:'flex-start',
    color: '#FFF', // Texto branco
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeText: {
    marginLeft: 20,
    alignSelf:'flex-start',
    color: '#CCC', // Texto branco acinzentado
    fontSize: 18,
  },

  planoButton: {
    backgroundColor: '#4CAF50', // Cor de fundo para o botão
    padding: 10,
    borderRadius: 5,
    width: '80%', // 80% da largura da tela
    height: 40, // Altura fixa de 40px
    alignSelf: 'center', // Centraliza o botão
    marginTop: 20, // Adiciona espaçamento acima do botão
  },

});

export default Home;
