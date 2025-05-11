import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { getExercicioTecnicoById } from '@/lib/appwrite';

// Tipo para detalhes de exercício técnico
type TechExerciseDetails = {
  id: string;
  nome: string;
  instrucoes: string;
  video: string;
  desporto: string;
};

const ExercicioTecnicoDetalhes = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exercise, setExercise] = useState<TechExerciseDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      try {
        const docs = await getExercicioTecnicoById(id as string);
        if (!docs || docs.length === 0) throw new Error('Exercício técnico não encontrado');
        const ex = docs[0];
        setExercise({
          id: ex.id || (id as string),
          nome: ex.nome || 'Nome indisponível',
          instrucoes: ex.instrucoes || 'Sem instruções disponíveis.',
          video: ex.video || '',
          desporto: ex.desporto || '',
        });
      } catch (err: any) {
        console.error('Erro ao carregar exercício técnico:', err);
        setError('Não foi possível carregar o exercício técnico.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchExercise();
    else {
      setError('ID inválido.');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (error || !exercise) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error || 'Erro desconhecido.'}</Text>
      </SafeAreaView>
    );
  }

  // Função para obter URL embed do YouTube
  const getEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      let videoId: string | null = null;
      if (parsed.hostname.includes('youtu.be')) videoId = parsed.pathname.slice(1);
      else if (parsed.hostname.includes('youtube.com')) videoId = parsed.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch {
      return url;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.exerciseHeader}>
          <Text style={styles.title}>{exercise.nome}</Text>
          <Text style={styles.subtitle}>Desporto: {exercise.desporto}</Text>
        </View>

        {exercise.video ? (
          <View style={styles.videoContainer}>
            {Platform.OS === 'web' ? (
              <iframe
                width="100%"
                height="250"
                src={getEmbedUrl(exercise.video)}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <WebView
                style={{ flex: 1 }}
                source={{ uri: getEmbedUrl(exercise.video) }}
                allowsFullscreenVideo
              />
            )}
          </View>
        ) : (
          <Text style={styles.noVideoText}>Vídeo não disponível</Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instruções</Text>
          <Text style={styles.instructionText}>{exercise.instrucoes}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  scrollContainer: { paddingBottom: 20 },
  exerciseHeader: { marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 28, color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#AAA', marginTop: 4 },
  videoContainer: { alignSelf: 'center', width: '100%', height: 250, borderRadius: 12, overflow: 'hidden', backgroundColor: '#333', marginBottom: 20 },
  noVideoText: { color: '#AAA', textAlign: 'center', marginBottom: 20 },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 22, color: '#FFFFFF', fontWeight: 'bold', marginBottom: 12 },
  instructionText: { fontSize: 16, color: '#E0E0E0', lineHeight: 24, textAlign: 'justify' },
  loadingText: { fontSize: 18, color: '#AAA', marginTop: 10 },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center' },
});

export default ExercicioTecnicoDetalhes;
