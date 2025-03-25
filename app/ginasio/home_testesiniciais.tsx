import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const HomeTestesIniciais = () => {
  const navigateToTestesCampo = () => {
    router.push('/ginasio/home_testescampo')
  }

  const navigateToTestesGinasio = () => {
    router.push('/ginasio/home_testesgym')
  }

  return (
    <View style={styles.container}>
      {/* Botão para Testes em Campo */}
      <TouchableOpacity 
        style={styles.buttonContainer} 
        onPress={navigateToTestesCampo}
      >
        <ImageBackground
          source={require('../../assets/images/campo.jpg')}
          style={styles.buttonBackground}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Text style={styles.buttonText}>TESTES EM CAMPO</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {/* Botão para Testes de Ginásio */}
      <TouchableOpacity 
        style={styles.buttonContainer} 
        onPress={navigateToTestesGinasio}
      >
        <ImageBackground
          source={require('../../assets/images/ginasio.jpg')}
          style={styles.buttonBackground}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Text style={styles.buttonText}>TESTES DE GINÁSIO</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Fundo preto
    padding: 16,
  },
  buttonContainer: {
    flex: 1,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#fff', // Sombra branca para contraste
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonBackground: {
    width: '100%',
    height: Dimensions.get('window').height / 2.5,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
    padding: 16,
  },
})

export default HomeTestesIniciais