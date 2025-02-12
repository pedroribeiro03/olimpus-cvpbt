import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import FormField from '../../components/FormField';
import { Link, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import {CreateUser} from '../../lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';

const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    nome: '',
    dtNascimento: '',
    desporto: 'Rugby',
    posicao: 'Pilar',
    altura: '',
    peso: '',
  });

  const rugbyPositions = [
    'Pilar',
    'Talonador',
    '2ª Linha',
    '3ª Linha',
    'Formação',
    'Abertura',
    'Centro',
    '3 de trás',
  ];

  const footballPositions = [
    'Guarda-Redes',
    'Defesa Central',
    'Defesa Lateral',
    'Médio Defensivo',
    'Médio Centro',
    'Médio Ofensivo',
    'Extremo',
    'Ponta de Lança',
  ];


  const positions = form.desporto === 'rugby' ? rugbyPositions : footballPositions;

  const [isSubmitting, setSubmitting] = useState(false);
  const { setUser, setIsLogged } = useGlobalContext();
  


  const submit = async () => {
    if (form.username === "" || form.email === "" || form.password === "" 
      || form.altura === "" || form.desporto === "" || form.peso === ""
      || form.posicao === "" || form.dtNascimento === "" ) {
      Alert.alert("Error", "Por favor preencha todos os campos");
    }
    setSubmitting(true);
    console.log(isSubmitting);

    try {
      const result = await CreateUser(form.email, form.password, form.username, form.nome, parseInt(form.peso),
                                      parseInt(form.altura), form.desporto, form.posicao, form.dtNascimento);
      setUser(result);
      setIsLogged(true);
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
        backgroundColor: 'black',
        flex: 1,
      }}
    >
      <ScrollView>
        <View
          style={{
            width: '100%',
            justifyContent: 'center',
            height: '100%',
            alignItems: 'center',
          }}
        >
          <Image
            source={require('../../assets/images/Logo_sf.png')}
            style={{
              width: 180,
              height: 124,
              margin: 10,
              justifyContent: 'center',
              alignSelf: 'center',
            }}
            resizeMode="contain"
          />
          <FormField
            title="Username"
            value={form.username}
            placeholder={''}
            handleChangeText={(e: string) => setForm({ ...form, username: e })}
            keyboardType="default"
          />
          <FormField
            title="Email"
            value={form.email}
            placeholder={''}
            handleChangeText={(e: string) => setForm({ ...form, email: e })}
            keyboardType="email-address"
          />
          <FormField
            title="Password"
            value={form.password}
            placeholder={''}
            handleChangeText={(e: string) => setForm({ ...form, password: e })}
            secureTextEntry
          />
          <FormField
            title="Nome Completo"
            value={form.nome}
            placeholder={''}
            handleChangeText={(e: string) => setForm({ ...form, nome: e })}
          />
         <FormField
          title="Data de Nascimento"
          value={form.dtNascimento}
          placeholder="DD/MM/YYYY"
          keyboardType="numeric" // Exibe o teclado numérico
          maxLength={10} // Limita a entrada ao formato DD/MM/YYYY
          handleChangeText={(e: string) => {
            // Remove caracteres não numéricos
            let value = e.replace(/[^0-9]/g, '');

            // Formata a entrada para DD/MM/YYYY
            if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
            if (value.length > 5) value = `${value.slice(0, 5)}/${value.slice(5)}`;

            setForm({ ...form, dtNascimento: value });
          }}
        />


          <FormField
            title="Peso"
            value={form.peso}
            placeholder="(em kg)"
            keyboardType="numeric" // Configura o teclado numérico
            maxLength={3} // Limita a entrada a 3 caracteres
            handleChangeText={(e: string) => {
              // Filtra para aceitar apenas números
              const numericValue = e.replace(/[^0-9]/g, '');
              setForm({ ...form, peso: numericValue });
            }}
          />


          <FormField
            title="Altura"
            value={form.altura}
            placeholder="(em cm)"
            keyboardType="numeric" // Define o teclado numérico
            maxLength={3} // Limita a entrada a 3 caracteres
            handleChangeText={(e: string) => {
              // Permite apenas números
              const numericValue = e.replace(/[^0-9]/g, '');
              setForm({ ...form, altura: numericValue });
            }}
          />



          {/* Título e Picker para escolher o desporto */}
          <Text style={{ color: 'white', alignSelf: 'flex-start', marginLeft: '5%' }}>
            Desporto
          </Text>
          <Picker
            selectedValue={form.desporto}
            style={{
              width: '90%',
              height: 40,
              color: 'black',
              backgroundColor: 'white',
              marginVertical: 10,
              alignSelf: 'center',
            }}
            onValueChange={(value) => 
              setForm({ ...form, desporto: value, posicao: '' 
              })}
          >
            <Picker.Item label="Rugby" value="rugby" />
            <Picker.Item label="Futebol" value="futebol" />
          </Picker>

          {/* Título e Picker para escolher a posição */}
          <Text style={{ color: 'white', alignSelf: 'flex-start', marginLeft: '5%' }}>
            Posição
          </Text>
          <Picker
            selectedValue={form.posicao}
            style={{
              width: '90%',
              height: 40,
              color: 'black',
              backgroundColor: 'white',
              marginVertical: 10,
              alignSelf: 'center',
            }}
            onValueChange={(value) => setForm({ ...form, posicao: value })}
          >
            {positions.map((pos, index) => (
              <Picker.Item key={index} label={pos} value={pos} />
            ))}
          </Picker>

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
              {isSubmitting ? 'Aguarde...' : 'Registo'}
            </Text>
          </TouchableOpacity>
          <Link style={{ color:'#fff', textDecorationLine: 'underline' }} href='/(auth)/sign-in'>
              Já tem conta?
            </Link>
         </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
