import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Slot, Stack } from 'expo-router';
import GlobalProvider  from '../context/GlobalProvider'

const RootLayout = () => {
  return (
    <GlobalProvider>
      <Stack>
        <Stack.Screen name='index' options={{ headerShown: false }}/>
      </Stack>
    </GlobalProvider>

  )
}

//fffffff

export default RootLayout