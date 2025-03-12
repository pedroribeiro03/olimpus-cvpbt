import { Account, Client, ID, Avatars, Databases, Query } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform:'com.iscte.olimpus',
    projectId: '675878a9002fcfb813e2',
    databaseId: '67587a0d0004b468ea4a',
    user_frontEndCollectionId: '6758cd83002c528d89a9',
    user_backEndCollectionId: '6758cda2001c98a6ccf1',
    storageId:'67596490002da8abfe9e',
    grupoMuscularCollectionId: '6758ce1a000e25433d69',
    exercicioGinasioCollectionId: '6758cd7f0031871a322b',
    treinoGinasioCollectionId: '6758cdbc000a0cddd39e',
    registoTreinoCollectionId: '6758ce040005bcc9e031',
    
}


// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.
;

const account = new Account(client);
const databases = new Databases(client);


export const CreateUser = async (email, password, username, nome, peso, altura, desporto, posicao, dtNascimento) => {
    try{

        const newAccount = await account.create(
            id= ID.unique(),
            email,
            password,
            username
        )

        if(!newAccount) throw Error;
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
        )
        console.log("id: " ,id);

        return newUser;

    }catch(error){
        console.log(error);
        throw new Error(error);
    }
}




export const SignIn = async(email, password) =>{
    try {
        const session = await account.createEmailPasswordSession(email,password)
        console.log("Sucesso")
        return session;
        
    } catch (error) {
        throw new Error(error)
    }
}

// Get Account
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
      // Buscar o utilizador com o ID fornecido
      const user = await databases.listDocuments(
        config.databaseId,
        config.user_frontEndCollectionId, // Coleção onde os usuários são armazenados
        [Query.equal('IDUtilizador', String(userId))] // Filtro para encontrar o usuário pelo ID
      );
  
      // Verifica se o usuário foi encontrado
      if (user.documents.length > 0) {
        return user.documents[0]; // Retorna o primeiro usuário encontrado
      } else {
        throw new Error('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar o utilizador:', error);
      throw error; // Lança o erro para ser tratado na chamada
    }
  };
export const getCurrentUser = async () => {
    try {
        const currentAcount = await getAccount();
        if(!currentAcount) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.user_frontEndCollectionId,
            [Query.equal('IDUtilizador', String(currentAcount.$id))]
        )
        if(!currentUser) throw Error;
        return currentUser.documents[0];
    } catch (error) {
        console.log(error)
        return null;
    }
}


export const getCurrentUserBE = async () => {
  try {
      const currentAcount = await getAccount();
      if(!currentAcount) throw Error;

      const currentUser = await databases.listDocuments(
          config.databaseId,
          config.user_backEndCollectionId,
          [Query.equal('IDUtilizador', String(currentAcount.$id))]
      )
      if(!currentUser) throw Error;
      return currentUser.documents[0];
  } catch (error) {
      console.log(error)
      return null;
  }
}

export const isBackend = async() => {
  try{
    const currentAccount = await account.get(); // Obtém o usuário atual
    if (!currentAccount) throw new Error("Utilizador não autenticado!");

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.user_backEndCollectionId, // Coleção do backend
      [Query.equal('IDUtilizador', String(currentAccount.$id))]
  );

      if (currentUser.documents.length > 0) {
          return true; // O IDUtilizador existe na coleção
      } else {
          return false; // O IDUtilizador não foi encontrado na coleção
      }
  }catch (error){
    console.error('Erro ao verificar ID no backend:', error);
    return false; // Retorna false em caso de erro
  } 
}

export async function signOut() {
    try {
      const session = await account.deleteSession("current");
  
      return session;
    } catch (error) {
      throw new Error(error);
    }
  }

export const insertExercicio = async () => {
        try {
            for (let i = 0; i < EXERCICIOS.length; i++) {
                const exerciseData = EXERCICIOS[i];
                const response = await databases.createDocument(
                    config.databaseId, // Substitui pelo ID da tua base de dados
                    config.exercicioGinasioCollectionId, // Substitui pelo ID da coleção "exercicioGinasio"
                    ID.unique(), // Gerar automaticamente um ID único
                    exerciseData
                );
                console.log(`Exercício ${i + 1} criado com sucesso:`, response);
            }
        } catch (error) {
            console.error('Erro ao criar exercício:', error);
        }
};

export const getExercisesForDate = async (date) => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error("Usuário não autenticado!");
  
      // Construir os intervalos de datetime para o dia
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
  
      // Buscar treinoGinasio para o intervalo de tempo
      const treinoResult = await databases.listDocuments(
        config.databaseId,
        config.treinoGinasioCollectionId,
        [
          Query.equal("user", String(currentUser.$id)),       // Filtra pelo usuário
          Query.greaterThanEqual("data", startOfDay),    // Filtra a partir do início do dia
          Query.lessThan("data", endOfDay),          // Filtra até o final do dia
        ]
      );
      
 
      if (treinoResult.total === 0) {
        throw new Error("Nenhum treino encontrado para este dia.");
      }
  
      const treinoIds = treinoResult.documents.map((doc) => doc.$id);
  
      // Buscar registros das séries
      const registoResult = await databases.listDocuments(
        config.databaseId,
        config.registoTreinoCollectionId,
        [Query.equal("treinoGinasio_id", treinoIds)]
      );
      if (registoResult.total === 0) {
        throw new Error("Nenhum registo de exercício encontrado para este treino.");
      }
  

      const exerciseData = registoResult.documents.map((registo) => ({
        nome: registo.exercicioGinasio_id.nome || "Exercício desconhecido", // Use o campo "nome" diretamente        
        series: registo.serie, // Número de séries
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
      const currentUser = await getCurrentUser();
      if (!currentUser) throw new Error("Usuário não autenticado!");
      const exercicio = await databases.listDocuments(
        config.databaseId,
        config.exercicioGinasioCollectionId,
        [
          Query.equal("$id", id),
        ])


       const exercicio_data = exercicio.documents.map((ex) => ({
          id: ex.$id || "Exercício desconhecido", // Use o campo "nome" diretamente        
          nome: ex.nome, 
          instrucoes: ex.instrucoes,
          video: ex.video,
          grupoMuscular1: ex.grupoMuscular1 ,
          grupoMuscular2: ex.grupoMuscular2
        }));

      return exercicio_data;

    } catch (error) {
      console.error("Exercício não encontrado", error.message);
      throw error;
    }

  };

  export const getAllExercises = async() =>{
    const exercises = await databases.listDocuments(
      config.databaseId,
      config.exercicioGinasioCollectionId,
    )
    return exercises
  }

  export const getAllUsers = async() =>{
    const users = await databases.listDocuments(
      config.databaseId,
      config.user_frontEndCollectionId,

    )
    return users
  }

  
  
