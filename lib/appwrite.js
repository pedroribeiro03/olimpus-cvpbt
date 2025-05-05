import { Account, Client, ID, Avatars, Databases, Query } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.iscte.olimpus',
    projectId: '675878a9002fcfb813e2',
    databaseId: '67587a0d0004b468ea4a',
    user_frontEndCollectionId: '6758cd83002c528d89a9',
    user_backEndCollectionId: '6758cda2001c98a6ccf1',
    storageId: '67596490002da8abfe9e',
    grupoMuscularCollectionId: '6758ce1a000e25433d69',
    exercicioGinasioCollectionId: '6758cd7f0031871a322b',
    treinoGinasioCollectionId: '6758cdbc000a0cddd39e',
    registoTreinoCollectionId: '6758ce040005bcc9e031',
    registoTestesIniciaisCollectionId: '67e2dc3d002a78bf32cb',
    testeInicialCollectionId: '6758cde40007734dd83c',
    aptidaoCollectionId: '6758cd30003d9ef800ae', // ID da coleção de aptidão
    treinoTecnicoCollectionId: '6758cdb0001f4bf97469', // ID da coleção existente
    registoTreinoTecnicoCollectionId: '67e7eb85002e24d78685',
    treinoCollectionId: '6758cddb0032fc331ac2'

};

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform);

const account = new Account(client);
const databases = new Databases(client);


/****************************************
 * FUNÇÕES DE AUTENTICAÇÃO E USUÁRIOS   *
 ****************************************/

export const CreateUser = async (email, password, username, nome, peso, altura, desporto, posicao, dtNascimento) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) throw Error;
        await SignIn(email, password);
        
        const newUser = await databases.createDocument(
            config.databaseId,
            config.user_frontEndCollectionId,
            ID.unique(),
            {
                email,
                nome,
                username,
                altura,
                peso,
                posicao,
                dtNascimento,
                IDUtilizador: newAccount.$id,
                desporto,
            }
        );
        
        return newUser;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

export const SignIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        throw new Error(error);
    }
};

export async function getAccount() {
    try {
        const currentAccount = await account.get();
        return currentAccount;
    } catch (error) {
        throw new Error(error);
    }
}

export const getUserById = async (userId) => {
    try {
        const user = await databases.listDocuments(
            config.databaseId,
            config.user_frontEndCollectionId,
            [Query.equal('IDUtilizador', String(userId))]
        );
        if (user.documents.length > 0) {
            return user.documents[0];
        } else {
            throw new Error('Usuário não encontrado');
        }
    } catch (error) {
        console.error('Erro ao buscar o utilizador:', error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const currentAccount = await getAccount();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.user_frontEndCollectionId,
            [Query.equal('IDUtilizador', String(currentAccount.$id))]
        );
        
        if (!currentUser) throw Error;
        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getCurrentUserBE = async () => {
    try {
        const currentAccount = await getAccount();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.user_backEndCollectionId,
            [Query.equal('IDUtilizador', String(currentAccount.$id))]
        );
        
        if (!currentUser) throw Error;
        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const isBackend = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw new Error("Utilizador não autenticado!");

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.user_backEndCollectionId,
            [Query.equal('IDUtilizador', String(currentAccount.$id))]
        );

        return currentUser.documents.length > 0;
    } catch (error) {
        console.error('Erro ao verificar ID no backend:', error);
        return false;
    }
};

export async function signOut() {
    try {
        const session = await account.deleteSession("current");
        return session;
    } catch (error) {
        throw new Error(error);
    }
}

/****************************************
 * FUNÇÕES DE EXERCÍCIOS E TREINOS      *
 ****************************************/

export const getExercisesForDate = async (date) => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser ) {
        throw new Error("Usuário não autenticado!");
      }
  
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
  
      // 1. Busca os treinos do dia
      const treinoResult = await databases.listDocuments(
        config.databaseId,
        config.treinoGinasioCollectionId,
        [
          Query.equal("user", String(currentUser.$id)),
          Query.greaterThanEqual("data", startOfDay),
          Query.lessThan("data", endOfDay),
        ]
      );
  
      if (treinoResult.total === 0) {
        return []; // Retorna array vazio em vez de erro
      }
  
      const treinoIds = treinoResult.documents.map((doc) => doc.$id);
  
      // 2. Busca os registros de treino
      const registoResult = await databases.listDocuments(
        config.databaseId,
        config.registoTreinoCollectionId,
        [Query.equal("treinoGinasio_id", treinoIds)]
      );
  
      // 3. Processamento seguro dos exercícios
      return registoResult.documents
        .filter(registo => registo.exercicioGinasio_id) // Filtra registros sem exercício
        .map((registo) => {
          const exercicio = registo.exercicioGinasio_id || {};
          return {
            nome: exercicio.nome || "Exercício desconhecido",
            series: registo.serie || 0,
            reps: registo.reps || 0,
            idExercicio: exercicio.$id || `temp-${Math.random().toString(36).substr(2, 9)}`,
            // Adicione outros campos necessários
            grupoMuscular1: exercicio.grupoMuscular1,
            grupoMuscular2: exercicio.grupoMuscular2
          };
        });
  
    } catch (error) {
      console.error("Erro ao obter exercícios:", error);
      return []; // Retorna array vazio em caso de erro
    }
  };

// Atualize a função getExercisesForDateBE
// Funções auxiliares para validação
const validateString = (value, name) => {
  if (!value || typeof value !== 'string') {
      throw new Error(`Invalid ${name}: must be a non-empty string`);
  }
  return value;
};

// Versão segura de getExercisesForDateBE
export const getExercisesForDateBE = async (userId, date) => {
  try {
      validateString(userId, 'userId');
      validateString(date, 'date');

      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;

      // 1. Busca os treinos do dia
      const treinoResult = await databases.listDocuments(
          config.databaseId,
          config.treinoGinasioCollectionId,
          [
              Query.equal('user', userId),
              Query.greaterThanEqual('data', startOfDay),
              Query.lessThan('data', endOfDay)
          ]
      );

      if (treinoResult.total === 0) {
          return [];
      }

      const treinoIds = treinoResult.documents.map(doc => doc.$id);

      // 2. Busca os registros de treino
      const registoResult = await databases.listDocuments(
          config.databaseId,
          config.registoTreinoCollectionId,
          [Query.equal('treinoGinasio_id', treinoIds)]
      );

      // 3. Processamento seguro dos dados
      return registoResult.documents.map(doc => {
          const exercicio = doc.exercicioGinasio_id || {};
          return {
              idExercicio: exercicio.$id || '',
              nome: exercicio.nome || 'Exercício sem nome',
              series: doc.serie || 0,
              reps: doc.reps || 0,
              grupoMuscular1: exercicio.grupoMuscular1 || '',
              grupoMuscular2: exercicio.grupoMuscular2 || ''
          };
      });

  } catch (error) {
      console.error('Error in getExercisesForDateBE:', {
          error: error.message,
          userId,
          date
      });
      return [];
  }
};





export const getExerciseById = async (id) => {
    try {
        const exercicio = await databases.listDocuments(
            config.databaseId,
            config.exercicioGinasioCollectionId,
            [Query.equal("$id", id)]
        );

        return exercicio.documents.map((ex) => ({
            id: ex.$id,
            nome: ex.nome,
            instrucoes: ex.instrucoes,
            video: ex.video,
            grupoMuscular1: ex.grupoMuscular1,
            grupoMuscular2: ex.grupoMuscular2
        }));
    } catch (error) {
        console.error("Exercício não encontrado", error.message);
        throw error;
    }
};

export const getAllExercises = async (limit = 25, offset = 0) => {
    try {
        const response = await databases.listDocuments(
            config.databaseId,
            config.exercicioGinasioCollectionId,
            [
                Query.limit(limit),
                Query.offset(offset),
            ]
        );
        return response;
    } catch (error) {
        console.error('Erro ao obter exercícios:', error);
        throw error;
    }
};

export const getGruposMusculares = async () => {
    try {
        const response = await databases.listDocuments(
            config.databaseId,
            config.grupoMuscularCollectionId
        );
        return response.documents.map((doc) => ({
            label: doc.nome,
            value: doc.$id,
        }));
    } catch (error) {
        console.error('Erro ao buscar grupos musculares:', error);
        throw error;
    }
};

export const createExercise = async (nome, video, instrucoes, grupoMuscular1, grupoMuscular2) => {
    try {
        const response = await databases.createDocument(
            config.databaseId,
            config.exercicioGinasioCollectionId,
            ID.unique(),
            {
                nome,
                video,
                instrucoes,
                grupoMuscular1,
                grupoMuscular2,
            }
        );
        return response;
    } catch (error) {
        console.error('Erro ao criar exercício:', error);
        throw error;
    }
};

export const updateExercise = async (id, nome, video, instrucoes, grupoMuscular1, grupoMuscular2) => {
    try {
        const response = await databases.updateDocument(
            config.databaseId,
            config.exercicioGinasioCollectionId,
            id,
            {
                nome,
                video,
                instrucoes,
                grupoMuscular1,
                grupoMuscular2,
            }
        );
        return response;
    } catch (error) {
        console.error('Erro ao atualizar exercício:', error);
        throw error;
    }
};

export const getExerciseByIdBackend = async (id) => {
    try {
        const response = await databases.listDocuments(
            config.databaseId,
            config.exercicioGinasioCollectionId,
            [Query.equal('$id', id)]
        );
        return response.documents;
    } catch (error) {
        console.error('Erro ao buscar exercício:', error);
        throw error;
    }
};

export const deleteExercise = async (id) => {
    try {
        await databases.deleteDocument(
            config.databaseId,
            config.exercicioGinasioCollectionId,
            id
        );
        return true;
    } catch (error) {
        console.error('Erro ao apagar exercício:', error);
        throw error;
    }
};

export const getAllUsers = async (limit = 25, offset = 0) => {
    try {
        const response = await databases.listDocuments(
            config.databaseId,
            config.user_frontEndCollectionId,
            [],
            limit,
            offset
        );
        return response;
    } catch (error) {
        console.error('Erro ao obter utilizadores:', error);
        throw error;
    }
};

export const createWorkoutSession = async (userId, date) => {
    try {
      const workout = await databases.createDocument(
        config.databaseId,
        config.treinoGinasioCollectionId,
        ID.unique(),
        {
          user: userId,
          data: date,
        }
      );
      return workout.$id;
    } catch (error) {
      console.error('Erro ao criar sessão de treino:', error);
      throw new Error('Erro ao criar sessão de treino');
    }
  };

  
  export const createExerciseRecord = async (exerciseId, workoutId, series, reps) => {
    try {
      const record = await databases.createDocument(
        config.databaseId,
        config.registoTreinoCollectionId,
        ID.unique(),
        {
          exercicioGinasio_id: exerciseId,
          treinoGinasio_id: workoutId,
          serie: series,
          reps: reps,
        }
      );
      return record;
    } catch (error) {
      console.error('Erro ao registar exercício no treino:', error);
      throw new Error('Erro ao registar exercício no treino');
    }
  };
  

/****************************************
 * FUNÇÕES PARA TESTES DE CAMPO/GINÁSIO *
 ****************************************/


/**
 * Obtém todos os testes de campo (onde tipoteste NÃO é o ID da aptidão força máxima)
 */
export const getTestesCampo = async () => {
  try {
    // Busca apenas documentos onde tipoTeste NÃO é o ID da aptidão força máxima
    const response = await databases.listDocuments(
      config.databaseId,
      config.testeInicialCollectionId,
      [
        Query.notEqual("tipoTeste", "67e138d4003d2771b2c3"),        
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error("Erro ao buscar testes de campo:", error);
    return [];
  }
};
/**
 * Obtém todos os testes de ginásio (onde tipoteste É o ID da aptidão força máxima)
 */
export const getTestesGinasio = async () => {
  try {
    // Busca apenas documentos onde tipoTeste NÃO é o ID da aptidão força máxima
    const response = await databases.listDocuments(
      config.databaseId,
      config.testeInicialCollectionId,
      [
        Query.equal("tipoTeste", "67e138d4003d2771b2c3"),        
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error("Erro ao buscar testes de campo:", error);
    return [];
  }
};

export const getAllTestesIniciais = async (limit = 25, offset = 0) => {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.testeInicialCollectionId,
        [
          Query.limit(limit),
          Query.offset(offset),
        ]
      );
      return response;
    } catch (error) {
      console.error('Erro ao obter testes iniciais:', error);
      throw error;
    }
  };
  
