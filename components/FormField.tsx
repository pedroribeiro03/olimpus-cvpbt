import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { TextInput } from 'react-native-gesture-handler'



const FormField = ({title, value, handleChangeText, placeholder,...props}) => {
    const [showPassword, setShowPassword] = useState(false)
   
  return (
    <View 
        style = {{
            justifyContent:'flex-start',
            alignItems:'flex-start',
            width:'90%'
        }}
    >
        <Text 
        style={{
          color: '#fff',
          marginBottom: 5, // Espaçamento entre o título e o campo
          fontSize: 16, // Melhor tamanho para o texto
        }}
      >
        {title}
      </Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        placeholderTextColor='#7b7b8b'
        onChangeText={handleChangeText}
        secureTextEntry ={title === 'Password' && !showPassword}
        style={{
          width: '100%', 
          height: 40, 
          backgroundColor: 'white', 
          borderRadius: 5, 
          paddingHorizontal: 10, 
          fontSize: 14, 
          color: 'black', 
        }}
        {...props} 
      />
      

    </View>
  )
}

export default FormField