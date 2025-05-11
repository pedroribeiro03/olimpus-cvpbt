import { View, Text } from 'react-native'
import React from 'react'
import { Tabs, Redirect } from 'expo-router'

const TabsLayout = () => {
  return (
    <>
    <Tabs>
      <Tabs.Screen
        name = 'home' options={{ title: "Treinador" }}
      />
      <Tabs.Screen
        name = 'refeicoes' options={{ title: "Nutricionista" }}
      />
      <Tabs.Screen
        name = 'descanso' options={{ title: "Fisioterapeuta" }}
      />
      <Tabs.Screen
        name = 'profile' options={{ title: "Perfil" }}
      />

    </Tabs>
    </>
  )
}

export default TabsLayout