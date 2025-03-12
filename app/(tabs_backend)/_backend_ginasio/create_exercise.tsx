import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const CreateExercise = () => {
  const [nome, setNome] = useState('');
  const [video, setVideo] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [grupoMuscular1, setGrupoMuscular1] = useState(null);
  const [grupoMuscular2, setGrupoMuscular2] = useState(null);

  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  
  const [muscleGroups] = useState([
    { label: 'Peito', value: 'peito' },
    { label: 'Costas', value: 'costas' },
    { label: 'Pernas', value: 'pernas' },
    { label: 'Ombros', value: 'ombros' },
    { label: 'Braços', value: 'bracos' },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} />

      <Text style={styles.label}>Vídeo (Link)</Text>
      <TextInput style={styles.input} value={video} onChangeText={setVideo} />

      <Text style={styles.label}>Instruções</Text>
      <TextInput 
        style={[styles.input, { height: 80 }]} 
        value={instrucoes} 
        onChangeText={setInstrucoes} 
        multiline
      />

      <Text style={styles.label}>Grupo Muscular 1</Text>
      <DropDownPicker
        open={open1}
        value={grupoMuscular1}
        items={muscleGroups}
        setOpen={setOpen1}
        setValue={setGrupoMuscular1}
        style={styles.dropdown}
      />

      <Text style={styles.label}>Grupo Muscular 2</Text>
      <DropDownPicker
        open={open2}
        value={grupoMuscular2}
        items={muscleGroups}
        setOpen={setOpen2}
        setValue={setGrupoMuscular2}
        style={styles.dropdown}
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Criar Exercício</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1a1a1a', // Fundo preto
      padding: 20,
    },
    label: {
      fontSize: 16,
      color: '#fff', // Texto branco para contraste
      marginBottom: 5,
    },
    input: {
      backgroundColor: '#fff', // Campo branco
      color: '#000', // Texto preto
      padding: 12,
      borderRadius: 8,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#ccc',
    },
    dropdownContainer: {
      marginBottom: 20,
      zIndex: 3000, // Garante que este dropdown fique no topo quando aberto
      elevation: 3,
    },
    dropdownContainer2: {
      marginBottom: 20,
      zIndex: 2000, // Fica abaixo do primeiro, mas acima de outros elementos
      elevation: 2,
    },
    dropdown: {
      backgroundColor: '#fff',
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 12,
    },
    button: {
      backgroundColor: '#4CAF50',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
    },
  });
  
  
  
  export default CreateExercise;