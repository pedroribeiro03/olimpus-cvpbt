import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createRegistroTreinoTecnico, getCurrentUser } from '@/lib/appwrite';

export default function RegistroTreinoTecnico() {
  const { id } = useLocalSearchParams();
  const [observacoes, setObservacoes] = useState('');
  const router = useRouter();

  const handleRegistro = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('Usuário não autenticado');

      await createRegistroTreinoTecnico(id as string, user.$id, observacoes);
      Alert.alert('Sucesso', 'Treino registrado!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao registrar treino');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Observações (opcional)"
        value={observacoes}
        onChangeText={setObservacoes}
        multiline
      />
      <Button title="Registrar Treino" onPress={handleRegistro} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    minHeight: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    textAlignVertical: 'top',
  },
});