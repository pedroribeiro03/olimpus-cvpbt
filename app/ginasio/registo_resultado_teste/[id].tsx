import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTesteInicialById, getRegistosByTesteAndUser, registarResultado } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Tipos para os dados
interface TesteInicial {
  $id: string;
  nome: string;
  unidade_medida: string;
  // outros campos se existirem...
}

interface RegistoTeste {
  $id: string;
  Resultado: string;
  $createdAt: string;
  // outros campos se existirem...
}

const RegistoResultadoTeste: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useGlobalContext();

  const [teste, setTeste] = useState<TesteInicial | null>(null);
  const [resultado, setResultado] = useState<string>('');
  const [registos, setRegistos] = useState<RegistoTeste[]>([]);
  const [melhorResultado, setMelhorResultado] = useState<number | null>(null);

  const fetchDados = async () => {
    try {
      // Carrega o teste inicial
      const testeFetched = await getTesteInicialById(id as string);
      setTeste(testeFetched);

      // Carrega registos do utilizador
      const registosFetched = await getRegistosByTesteAndUser(id as string, user.$id);
      if (Array.isArray(registosFetched)) {
        setRegistos(registosFetched);
        if (registosFetched.length > 0) {
          // Extrai os valores numéricos
          const valores = registosFetched.map(r => parseFloat(r.Resultado));
          // Decide operador conforme unidade de medida
          const unidade = testeFetched.unidade_medida.toLowerCase();
          const isTempo = unidade === 'seg' || unidade === 'min';
          const melhor = isTempo
            ? Math.min(...valores)
            : Math.max(...valores);
          setMelhorResultado(melhor);
        } else {
          setMelhorResultado(null);
        }
      } else {
        setRegistos([]);
        setMelhorResultado(null);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  const handleRegistar = async () => {
    if (!resultado) {
      Alert.alert('Erro', 'Insere um valor antes de registar.');
      return;
    }
    try {
      await registarResultado(id as string, user.$id, resultado);
      Alert.alert('Sucesso', 'Resultado registado com sucesso!');
      setResultado('');
      fetchDados();
    } catch (err) {
      console.error('Erro ao registar resultado:', err);
      Alert.alert('Erro', 'Não foi possível registar o resultado.');
    }
  };

  useEffect(() => {
    if (user?.$id && id) fetchDados();
  }, [user, id]);

  if (!teste) {
    return <Text style={styles.loading}>A carregar dados do teste...</Text>;
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="arrow-left"
        size={30}
        color="#fff"
        style={styles.voltarIcon}
        onPress={() => router.push('/ginasio/home_testesiniciais')}
      />

      <Text style={styles.titulo}>{teste.nome}</Text>
      <Text style={styles.label}>Resultado ({teste.unidade_medida})</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={resultado}
          onChangeText={setResultado}
          placeholder="ex: 45"
        />
        <Text style={styles.unidade}>{teste.unidade_medida}</Text>
      </View>

      <Button title="Registar Resultado" onPress={handleRegistar} color="#4CAF50" />

      {registos.length > 0 && melhorResultado !== null && (
        <View style={styles.melhorResultadoContainer}>
          <Text style={styles.melhorResultado}>
            Melhor Resultado: {melhorResultado} {teste.unidade_medida}
          </Text>
        </View>
      )}

      {registos.length > 0 && (
        <>
          <Text style={styles.subtitulo}>Registos Anteriores</Text>
          <FlatList
            data={registos}
            keyExtractor={item => item.$id}
            renderItem={({ item }) => (
              <View style={styles.registoItem}>
                <Text style={styles.registoTexto}>
                  Resultado: {item.Resultado} {teste.unidade_medida}
                </Text>
                <Text style={styles.registoTextoPequeno}>
                  Data: {new Date(item.$createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 16, color: '#ccc', marginBottom: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 10, fontSize: 16 },
  unidade: { color: '#fff', marginLeft: 10, fontSize: 16 },
  subtitulo: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 30, marginBottom: 10 },
  registoItem: { backgroundColor: '#2a2a2a', padding: 10, borderRadius: 6, marginBottom: 10 },
  registoTexto: { color: '#fff', fontSize: 16 },
  registoTextoPequeno: { color: '#aaa', fontSize: 12 },
  melhorResultadoContainer: { backgroundColor: '#3c3c3c', padding: 10, borderRadius: 6, marginBottom: 20 },
  melhorResultado: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loading: { color: '#fff', textAlign: 'center', marginTop: 50 },
  voltarIcon: { position: 'absolute', top: 20, left: 16, zIndex: 1 }
});

export default RegistoResultadoTeste;
