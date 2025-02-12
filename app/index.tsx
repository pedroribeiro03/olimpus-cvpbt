import { Text, Image, View, TouchableOpacity } from 'react-native';
import React from 'react';
import {Slot, Link, Redirect} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import { insertExercicio } from '@/lib/appwrite';




const RootLayout = () => {
  const {loading, isLogged} = useGlobalContext();
  console.log("Login?:" + isLogged)
  console.log("Loading?:" + loading)

  if(!loading && isLogged) return <Redirect href = '/(tabs)/home'/>
  return (
    
    <SafeAreaView style={{
        flex: 1,                  // Faz a View ocupar toda a altura da tela
        justifyContent: 'center', // Centraliza verticalmente
        alignItems: 'center',     // Centraliza horizontalmente
        backgroundColor: '#000'
    }}>
      <ScrollView style={{height:'100%'}}>
        <View style={{alignContent:'center', justifyContent:'center', flex:1, width:'100%', height:'100%'}}>
          <Image
              source = {require('../assets/images/Logo_sf.png')}
              style={{ width: 180, height: 124, margin: 10, justifyContent:'center', alignSelf:'center'}} // Ajusta ao tamanho do ecrã
              resizeMode='contain'
          />
          <Image
              source = {require('../assets/images/teste_condicao_fisica.png')}
              style={{ width: 350, height: 200, margin: 10, borderRadius:50, borderWidth:2, justifyContent:'center', alignSelf:'center'}} // Ajusta ao tamanho do ecrã
              resizeMode='contain'
          />
          <Text style={{color: 'white', fontSize:20, textAlign:'center', marginTop:20}}> 
            Treina como um atleta profissional {"\n"} com a {''}
            <Text style={{fontWeight:'bold'}}>
              OLIMPUS
            </Text>
          </Text>
          <TouchableOpacity
            style={{ 
              backgroundColor: '#bdc5c7', padding: 10, borderRadius: 5, width:'30%', alignSelf:'center', margin:20
            }}
          >
            <Link  style={{ color: 'white', textAlign: 'center' }} href="/(auth)/sign-in">
              Continua com o e-mail
            </Link>
          </TouchableOpacity>
          
          <StatusBar backgroundColor='#161622' style='light'/>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


export default RootLayout

