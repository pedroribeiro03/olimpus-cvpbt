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
        if (!currentUser) throw new Error("Usuário não autenticado!");

        const startOfDay = `${date}T00:00:00.000Z`;
        const endOfDay = `${date}T23:59:59.999Z`;

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
            throw new Error("Nenhum treino encontrado para este dia.");
        }

        const treinoIds = treinoResult.documents.map((doc) => doc.$id);

        const registoResult = await databases.listDocuments(
            config.databaseId,
            config.registoTreinoCollectionId,
            [Query.equal("treinoGinasio_id", treinoIds)]
        );

        const exerciseData = registoResult.documents.map((registo) => ({
            nome: registo.exercicioGinasio_id.nome || "Exercício desconhecido",
            series: registo.serie,
            reps: registo.reps,
            idExercicio: registo.exercicioGinasio_id.$id,
        }));

        return exerciseData;
    } catch (error) {
        console.error("Erro ao obter exercícios:", error.message);
        throw error;
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

 /** 
  // Função para obter detalhes de um teste específico
  export const getTesteById = async (id: string) => {
    try {
      const response = await databases.getDocument(
        config.databaseId,
        config.testeInicialCollectionId,
        id
      );
      return response;
    } catch (error) {
      console.error('Erro ao buscar teste:', error);
      throw error;
    }
  };
*/
  export const createTesteInicial = async (data: {
    nome: string;
    instrucoes: string;
    tipoTesteId?: string;
    exercicioGinasioId?: string;
  }) => {
    try {
      const response = await databases.createDocument(
        config.databaseId,
        config.testeInicialCollectionId,
        ID.unique(),
        {
          nome: data.nome,
          instrucoes: data.instrucoes,
          tipoTeste: data.tipoTesteId || null,
          exercicioGinasio_id: data.exercicioGinasioId || null
        }
      );
      return response;
    } catch (error) {
      throw new Error(`Erro ao criar teste: ${error.message}`);
    }
  };
  
  export const getAllTestesIniciais = async (limit = 25, offset = 0) => {
    try {
      return await databases.listDocuments(
        config.databaseId,
        config.testeInicialCollectionId,
        [Query.limit(limit), Query.offset(offset)]
      );
    } catch (error) {
      throw new Error(`Erro ao buscar testes: ${error.message}`);
    }
  };
  
  export const getTesteById = async (id: string) => {
    try {
      return await databases.getDocument(
        config.databaseId,
        config.testeInicialCollectionId,
        id
      );
    } catch (error) {
      throw new Error(`Erro ao buscar teste: ${error.message}`);
    }
  };
  
  export const deleteTesteInicial = async (id: string) => {
    try {
      // 1. Verificar se o usuário está autenticado como backend
      const currentUser = await getCurrentUserBE();
      
      if (!currentUser) {
        throw new Error('Acesso restrito a administradores do backend');
      }
  
      // 2. Executar a deleção
      await databases.deleteDocument(
        config.databaseId,
        config.testeInicialCollectionId,
        id
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar teste:', {
        error,
        userId: (await getAccount())?.$id,
        time: new Date().toISOString()
      });
      throw error;
    }
  };
  
  // Adicione junto com as outras funções de testes iniciais
export const getAptidoes = async () => {
    try {
      const response = await databases.listDocuments(
        config.databaseId,
        config.aptidaoCollectionId // Certifique-se que existe no seu config
      );
      return response.documents;
    } catch (error) {
      console.error('Erro ao buscar aptidões:', error);
      throw error;
    }
  };

  export const updateTesteInicial = async (id: string, data: {
    nome: string;
    instrucoes: string;
    tipoTesteId?: string;
    exercicioGinasioId?: string;
  }) => {
    try {
      const response = await databases.updateDocument(
        config.databaseId,
        config.testeInicialCollectionId,
        id,
        {
          nome: data.nome,
          instrucoes: data.instrucoes,
          tipoTeste: data.tipoTesteId || null,
          exercicioGinasio_id: data.exercicioGinasioId || null
        }
      );
      return response;
    } catch (error) {
      console.error('Erro ao atualizar teste:', error);
      throw new Error(`Falha ao atualizar teste: ${error.message}`);
    }
  };

  // TREINOS TECNICOS
  export const createTreinoTecnico = async ({ nome, video, sequencia, treino_id }: 
    { nome: string; video: string; sequencia: string; treino_id?: string }) => {
    try {
        const documentData = {
            nome,
            video,
            sequencia,
            treino_id: treino_id || null // Garante que não envie undefined
        };

        console.log("Dados sendo enviados:", documentData); // Para debug

        return await databases.createDocument(
            config.databaseId,
            config.treinoTecnicoCollectionId,
            ID.unique(),
            documentData
        );
    } catch (error) {
        console.error("Erro detalhado ao criar treino técnico:", error);
        throw error;
    }
};
  
//export const getAllTreinosTecnicos = async (limit = 25, offset = 0) => {
//  return await databases.listDocuments(
//    config.databaseId,
//    config.treinoTecnicoCollectionId,
//    [
  //    Query.limit(limit),
    //  Query.offset(offset),
//    ]
//  );
//};

// Registrar execução por um usuário
export const createRegistroTreinoTecnico = async (treinoId: string, userId: string, observacoes?: string) => {
  return await databases.createDocument(
    config.databaseId,
    config.registoTreinoTecnicoCollectionId,
    ID.unique(),
    {
      treino_tecnico: treinoId,
      userFrontend: userId,
      data: new Date().toISOString(),
      observacoes
    }
  );
};

export const getAllTreinos = async (limit = 25, offset = 0) => {
  try {
    return await databases.listDocuments(
      config.databaseId,
      config.treinoCollectionId, // Certifique-se que esta é a ID correta
      [
        Query.limit(limit),
        Query.offset(offset),
      ]
    );
  } catch (error) {
    console.error('Erro ao buscar treinos:', error);
    throw error;
  }
};

// Obter treino técnico por ID
//export const getTreinoTecnicoById = async (id: string) => {
  //try {
    //if (!databases) throw new Error("Databases não inicializado");
    
  //  console.log("Buscando treino técnico:", {
    //  databaseId: config.databaseId,
//      collectionId: config.treinoTecnicoCollectionId,
  //    id
//    });

  //  return await databases.getDocument(
    //  config.databaseId,
 //     config.treinoTecnicoCollectionId,
   //   id
 //   );
 // } catch (error) {
   // console.error("Erro detalhado:", {
     // error,
 //     config,
   //   id,
 //     databasesAvailable: !!databases
 //   });
   // throw error;
//  }
//};
// Adicione estas funções ao seu arquivo appwrite.ts

export const updateTreinoTecnico = async (id: string, data: {
  nome: string;
  video: string;
  sequencia: string;
  treino_id?: string;
}) => {
  try {
    const response = await databases.updateDocument(
      config.databaseId,
      config.treinoTecnicoCollectionId,
      id,
      {
        nome: data.nome,
        video: data.video,
        sequencia: data.sequencia,
        treino_id: data.treino_id || null
      }
    );
    return response;
  } catch (error) {
    console.error('Erro ao atualizar treino técnico:', error);
    throw error;
  }
};

//export const deleteTreinoTecnico = async (id: string) => {
  //try {
    //await databases.deleteDocument(
    //  config.databaseId,
      //config.treinoTecnicoCollectionId,
 //     id
   // );
//    return true;
//  } catch (error) {
  //  console.error('Erro ao eliminar treino técnico:', error);
    //throw error;
 // }
//};

// Adicione estas funções (modelo igual ao dos testes iniciais)
export const getTreinoTecnicoById = async (id) => {
  try {
    if (!databases) throw new Error("Databases not initialized");
    
    return await databases.getDocument(
      config.databaseId,
      config.treinoTecnicoCollectionId,
      id
    );
  } catch (error) {
    console.error("Error getting technical training:", error);
    throw error;
  }
};

export const getAllTreinosTecnicos = async (limit = 25, offset = 0) => {
  return await databases.listDocuments(
    config.databaseId,
    config.treinoTecnicoCollectionId,
    [
      Query.limit(limit),
      Query.offset(offset),
    ]
  );
};

export const deleteTreinoTecnico = async (id: string) => {
  try {
    await databases.deleteDocument(
      config.databaseId,
      config.treinoTecnicoCollectionId,
      id
    );
    return true;
  } catch (error) {
    console.error('Erro ao deletar treino técnico:', error);
    throw error;
  }
};

// No final do arquivo appwrite.ts, adicione:
const appwrite = {
  client,
  account,
  databases,
  config
};

export default appwrite;