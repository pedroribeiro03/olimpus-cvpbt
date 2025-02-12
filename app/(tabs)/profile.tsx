import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { useGlobalContext } from '@/context/GlobalProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from '@/lib/appwrite';
import { router } from 'expo-router';


const Profile = () => {
  const { user, setUser, setIsLogged, loading } = useGlobalContext();

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.replace('/sign-in');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image source={require('../../assets/images/Logo_sf.png')} style={styles.logo} />
        </View>

        <View style={styles.profileContainer}>
          {/* Foto de Perfil */}
          <View style={styles.profilePicContainer}>
            <Image
              source={user?.fotografia ? { uri: user.fotografia } : require('../../assets/images/default-profile.jpg')}
              style={styles.profilePic}
            />
            <TouchableOpacity style={styles.changePicButton}>
              <Text style={styles.changePicText}>Alterar Foto</Text>
            </TouchableOpacity>
          </View>

          {/* Detalhes do Perfil */}
          <View style={styles.profileInfoSection}>
            <Text style={styles.profileTitle}>Detalhes do Perfil</Text>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileLabel}>Nome</Text>
              <Text style={styles.profileValue}>{user?.nome || 'Não disponível'}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileLabel}>Email</Text>
              <Text style={styles.profileValue}>{user?.email || 'Não disponível'}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileLabel}>Desporto</Text>
              <Text style={styles.profileValue}>{user?.desporto || 'Não disponível'}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileLabel}>Posição</Text>
              <Text style={styles.profileValue}>{user?.posicao || 'Não disponível'}</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileLabel}>Altura</Text>
              <Text style={styles.profileValue}>{user?.altura || 'Não disponível'} cm</Text>
            </View>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileLabel}>Peso</Text>
              <Text style={styles.profileValue}>{user?.peso || 'Não disponível'} kg</Text>
            </View>
          </View>

          {/* Botão de Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  header: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  logo: {
    width: 180,
    height: 60,
    resizeMode: 'contain',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 10,
  },
  changePicButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  changePicText: {
    color: '#fff',
    fontSize: 14,
  },
  profileInfoSection: {
    width: '100%',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  profileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  profileLabel: {
    fontSize: 16,
    color: '#aaa',
    fontWeight: '600',
  },
  profileValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '400',
  },
  logoutButton: {
    backgroundColor: '#FF4C4C',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});
