import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs>
  
      {/* Definindo as telas dentro da pilha */}
      <Tabs.Screen name="users" options={{ title: "Utilizadores" }} />
      <Tabs.Screen name="exercises" options={{ title: "Exercícios" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    
      </Tabs>
  );
}
