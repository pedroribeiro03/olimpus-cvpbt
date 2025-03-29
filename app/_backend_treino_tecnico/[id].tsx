import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getTreinoTecnicoById, deleteTreinoTecnico, verifyConnection } from '@/lib/appwrite';

export default function TreinoTecnicoDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [treino, setTreino] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [connectionVerified, setConnectionVerified] = useState(false);

    useEffect(() => {
        const checkConnectionAndFetchData = async () => {
            try {
                setLoading(true);
                
                // 1. Verificar conexão com Appwrite
                const isConnected = await verifyConnection();
                if (!isConnected) {
                    throw new Error("Sem conexão com o servidor");
                }
                setConnectionVerified(true);

                // 2. Buscar dados do treino
                console.log(`Buscando treino técnico com ID: ${id}`);
                const treinoData = await getTreinoTecnicoById(id);
                
                if (!treinoData) {
                    throw new Error("Treino técnico não encontrado");
                }
                
                setTreino(treinoData);
            } catch (err) {
                console.error("Erro completo:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        checkConnectionAndFetchData();
    }, [id]);

    const handleEdit = () => {
        router.push(`/_backend_treino_tecnico/edit/${id}`);
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await deleteTreinoTecnico(id);
            Alert.alert('Sucesso', 'Treino técnico excluído com sucesso');
            router.replace('/(tabs_backend)/treinos_tecnicos');
        } catch (error) {
            Alert.alert('Erro', error.message || 'Falha ao excluir treino');
            console.error(error);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Carregando treino técnico...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Erro ao carregar</Text>
                <Text style={styles.errorText}>{error}</Text>
                
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => router.replace('/(tabs_backend)/treinos_tecnicos')}
                >
                    <Text style={styles.retryButtonText}>Voltar para a lista</Text>
                </TouchableOpacity>

                {!connectionVerified && (
                    <Text style={styles.connectionWarning}>
                        Verifique sua conexão com a internet
                    </Text>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{treino.nome}</Text>

            <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Sequência:</Text>
                <Text style={styles.detailText}>{treino.sequencia}</Text>
            </View>

            {treino.video && (
                <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Vídeo:</Text>
                    <Text 
                        style={[styles.detailText, styles.linkText]}
                        onPress={() => Linking.openURL(treino.video)}
                    >
                        {treino.video}
                    </Text>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={handleEdit}
                    disabled={deleting}
                >
                    <Text style={styles.buttonText}>Editar Treino</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={() => {
                        Alert.alert(
                            'Confirmar Exclusão',
                            'Tem certeza que deseja excluir este treino técnico?',
                            [
                                { text: 'Cancelar', style: 'cancel' },
                                { text: 'Excluir', onPress: handleDelete }
                            ]
                        );
                    }}
                    disabled={deleting}
                >
                    {deleting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Excluir Treino</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#1a1a1a',
    },
    errorTitle: {
        fontSize: 20,
        color: '#ff4444',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    connectionWarning: {
        color: '#ffcc00',
        marginTop: 10,
    },
    title: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    detailSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        color: '#4CAF50',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    detailText: {
        fontSize: 16,
        color: '#fff',
    },
    linkText: {
        color: '#2196F3',
        textDecorationLine: 'underline',
    },
    buttonContainer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        minWidth: '48%',
    },
    editButton: {
        backgroundColor: '#2196F3',
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    retryButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});