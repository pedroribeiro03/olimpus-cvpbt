import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Página Inicial" }} />
      <Stack.Screen name="ginasio/[date]" options={{ title: "Plano Diário" }} />
      <Stack.Screen
        name="ginasio/exercicio/[id]"
        options={{ title: "Detalhes do Exercício" }}
      />
    </Stack>
  );
}
