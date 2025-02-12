import { View, Text, Image, TouchableOpacity} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import FormField from '../../components/FormField';
import { Link,router } from 'expo-router';
import { getCurrentUser, SignIn } from '@/lib/appwrite';
import { Alert } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';


const signIn = () => {

  const[form, setForm] = useState({
    email:'',
    password:'',
  })

  const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);


  const submit = async () => {
    if (form.email === "" || form.password === "" ) {
      Alert.alert("Error", "Por favor preencha todos os campos");
    }
    setSubmitting(true);

    try {
      await SignIn(form.email, form.password)
      const result = await getCurrentUser();
      setUser(result);
      setIsLogged(true);

      Alert.alert("Success", "User signed in successfully");

      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", "Erro");
    } finally {
      setSubmitting(false);
    }
  };
  
  

  return (
    <SafeAreaView
      style={{
        backgroundColor:'black',
        flex:1
      }}>
        <ScrollView>
          <View
          style={{
            width:'100%',
            justifyContent:'center',
            height: '100%',
            alignItems: 'center',
          }}>
            <Image
            source = {require('../../assets/images/Logo_sf.png')}
            style={{ width: 180, height: 124, margin: 10, justifyContent:'center', alignSelf:'center'}} // Ajusta ao tamanho do ecrã
            resizeMode='contain'
            />
            
            
            <FormField
              title='Email'
              value = {form.email}
              placeholder={""}
              handleChangeText={(e:string) => setForm({...form, email:e})}
              keyboardType = "email-address"
            />
             <FormField
              title='Password'
              value = {form.password}
              placeholder={""}
              handleChangeText={(e:string) => setForm({...form, password:e})}
              secureTextEntry
            />
            <TouchableOpacity
            style={{
              backgroundColor: '#bdc5c7',
              padding: 10,
              borderRadius: 5,
              width: '30%',
              alignSelf: 'center',
              margin: 20,
            }}
            onPress={submit}
            disabled={isSubmitting}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              {isSubmitting ? 'Aguarde...' : 'Login'}
            </Text>
          </TouchableOpacity>
            <Link style={{ color:'#fff', textDecorationLine: 'underline' }} href='/(auth)/sign-up'>
              Ainda não tem conta?
            </Link>
          </View>
        </ScrollView>
    </SafeAreaView>
  )
}

export default signIn