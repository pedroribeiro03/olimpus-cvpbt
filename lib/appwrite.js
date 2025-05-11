import { Account, Client, ID, Avatars, Databases, Query } from 'react-native-appwrite';
import axios from 'axios';  

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
    treinoCollectionId: '6758cddb0032fc331ac2',
    planoDeRefeicoesCollectionId: '681fdc4b00122945e2cc',

};

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
if (!apiKey) {
  console.error("API Key não encontrada");
}

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform);

const account = new Account(client);
const databases = new Databases(client);
const storage = client.storage;



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

// Função para fazer upload de uma imagem
// Função para fazer upload de uma imagem
export const uploadImage = async (uri) => {
  try {
    // Converte a URI em um blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Cria um ID único para o arquivo
    const uniqueId = Date.now().toString();

    // Faz o upload para o Appwrite Storage
    const uploadResponse = await storage.createFile(
      config.bucketId,  // ID do bucket
      uniqueId,                 // ID único para o arquivo
      blob                      // O arquivo como blob
    );

    // Monta a URL da imagem
    const imageUrl = `${config.storageUrl}/buckets/${config.bucketId}/files/${uploadResponse.$id}/view?project=${config.projectId}`;

    // Retorna a URL da imagem
    return imageUrl;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw new Error('Erro ao fazer upload da imagem');
  }
};

// Função para atualizar a imagem no banco de dados (coleção user_frontend)
export const updateUserImage = async (userId, imageUrl) => {
  try {
    const result = await databases.listDocuments(
      config.databaseId,
      config.collectionId, // ID da coleção `user_frontend`
      [Query.equal('IDUtilizador', userId)] // Filtra pelo ID do usuário
    );

    if (result.total === 0) {
      throw new Error('Usuário não encontrado na base de dados.');
    }

    const documentId = result.documents[0].$id;

    // Atualiza o campo 'fotografia' com a URL da imagem no banco de dados
    await databases.updateDocument(
      config.databaseId,
      config.collectionId,  // ID da coleção `user_frontend`
      documentId,
      { fotografia: imageUrl }  // Atualizando o campo 'fotografia'
    );
  } catch (error) {
    console.error('Erro ao atualizar imagem no banco de dados:', error);
    throw new Error('Erro ao atualizar imagem no banco de dados');
  }
};

// Função para obter os dados do usuário atual
export const getUserData = async () => {
  try {
    // Obtém o usuário autenticado
    const user = await account.get();
    return user;
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    throw new Error('Erro ao obter dados do usuário');
  }
};



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
  

  //API DE IA

// Função para calcular idade com base na data de nascimento


const calcularIdade = (dataNascimento) => {
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

// Função para obter o perfil do atleta com base no userId
const getAthleteProfile = async (userId) => {
  try {
    // Aqui vais fazer a consulta ao banco de dados para obter as informações do atleta
    const response = await databases.listDocuments(
      config.databaseId,
      config.user_frontEndCollectionId, // Substitui pelo ID da coleção de atletas
      [
        Query.equal('IDUtilizador', userId) // Verifica se o userId bate
      ]
    );

    if (response.documents.length === 0) {
      throw new Error('Atleta não encontrado');
    }

    const atleta = response.documents[0];

    // Agora, vamos calcular a idade do atleta com a data de nascimento
    const idade = calcularIdade(atleta.dataNascimento);

    // Retorna o perfil do atleta
    return {
      idade,
      peso: atleta.peso,
      altura: atleta.altura,
      desporto: atleta.desporto,
      posicao: atleta.posicao
    };
  } catch (error) {
    console.error('Erro ao obter perfil do atleta:', error);
    throw error; // Lança o erro para ser tratado na função principal
  }
};


// Função para obter resultados dos testes físicos
const getTestResults = async (userId) => {
  try {
    // Lógica para obter resultados dos testes físicos do usuário
    const resultados = await databases.listDocuments(
      config.databaseId,
      '67e2dc3d002a78bf32cb', // ID da coleção de testes iniciais
      [Query.equal('userFrontend', userId)]
    );

    // Organizar resultados ou retornar 'N/A' se não existirem
    const resultadosTestes = resultados.documents.reduce((acc, teste) => {
      acc[teste.tipoTeste] = teste.Resultado || 'N/A';
      return acc;
    }, {});

    return resultadosTestes;
  } catch (error) {
    console.error("Erro ao obter resultados dos testes físicos:", error);
    return {}; // Retorna um objeto vazio caso não encontre resultados
  }
};

export const getTodayDate = () => {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Mes começa de 0 (Janeiro é 0)
  const ano = hoje.getFullYear();

  return `${ano}-${mes}-${dia}`;
};

const cleanJsonString = (jsonString) => {
  // Remove as marcações de formatação de código ```json e ```
  return jsonString.replace(/```json|```/g, '').trim();
};


// Função para obter todos os exercícios registrados
const getExerciciosDisponiveis = async () => {
  try {
    let allExercises = [];
    let offset = 0;
    let limit = 100; // Ou outro número razoável para cada requisição

    // Continuar buscando até que não haja mais exercícios
    while (true) {
      const response = await databases.listDocuments(
        config.databaseId,
        '6758cd7f0031871a322b', // ID da coleção de exercícios
        [
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      const exercises = response.documents.map((doc) => ({
        id: doc.$id,
        nome: doc.nome,
        video: doc.video,
        instrucoes: doc.instrucoes,
      }));

      allExercises = allExercises.concat(exercises); // Adiciona os exercícios encontrados

      if (response.documents.length < limit) {
        // Se o número de exercícios encontrados for menor que o limite, significa que não há mais documentos
        break;
      }

      // Caso contrário, ajusta o offset para buscar os próximos documentos
      offset += limit;
    }

    return allExercises; // Retorna todos os exercícios encontrados
  } catch (error) {
    console.error('Erro ao obter exercícios:', error);
    return []; // Retorna um array vazio em caso de erro
  }
};


// Função que chama as duas funções abaixo
// Função principal que chama as outras funções
export const generateTrainingPlan = async (userId) => {
  console.log("User ID 2: " + userId)
  try {
    // 1. Obter as informações do atleta
    const athleteProfile = await getAthleteProfile(userId);

    // 2. Chamar a API para gerar o plano de treino
    const trainingPlan = await callApiToGeneratePlan(athleteProfile);

    // 3. Guardar o plano de treino na base de dados
    await saveTrainingPlanToDatabase(trainingPlan, userId);

    //console.log('Plano de treino gerado e salvo com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar plano de treino:', error);
  }
};



// Função que chama a API da OpenAI para gerar o plano de treino
const callApiToGeneratePlan = async (athleteProfile) => {
  try {
    // 1. Obter lista de exercícios disponíveis
    const exerciciosDisponiveis = await getExerciciosDisponiveis();

    // 2. Preparar o prompt a ser enviado à API
    const todayDate = getTodayDate();
    const prompt = `
      Crie um plano de treino para o atleta com as seguintes informações:

      - Idade: ${athleteProfile.idade} anos
      - Peso: ${athleteProfile.peso} kg
      - Altura: ${athleteProfile.altura} cm
      - Desporto: ${athleteProfile.desporto}
      - Posição: ${athleteProfile.posicao}

      Lista de exercícios disponíveis:
      ${exerciciosDisponiveis.map(ex => `- ID: ${ex.id}, Nome: ${ex.nome}`).join('\n')}

      O plano de treino deve cobrir 7 dias consecutivos. Para cada dia da semana:
      - Se o atleta deve descansar, não gere treino para esse dia.
      - Se o atleta deve treinar, forneça os exercícios, número de séries e repetições.
      - Cada dia deve ter no mínimo 4 exerciícios e no máximo 8 exercícios registados
      - Hoje é dia ${todayDate}

      Responda no seguinte formato JSON:
      {
        "treinos": [
          {
            "data": "YYYY-MM-DD",
            "exercicios": [
              {"id_exercicio": "ID1", "nome": "nome do exercicio", "num_series": 4, "num_reps": 10},
              {"id_exercicio": "ID2", "nome": "nome do exercicio", "num_series": 3, "num_reps": 12}
            ]
          },
          // Continue para os outros dias
        ]
      }
    `;
    console.log("PROMPT: "+ prompt)

    // 3. Enviar o prompt para a API da OpenAI (GPT-3.5 Turbo)
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente de fitness. Gere planos de treino personalizados com base nas informações fornecidas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`, // Substitua com sua chave de API
        'Content-Type': 'application/json'
      }
    });

    // 4. Limpar a resposta da API para remover a formatação de código
    const responseText = response.data.choices[0].message.content;
    const cleanResponseText = cleanJsonString(responseText);

    // 5. Retornar o plano de treino gerado
    const trainingPlan = JSON.parse(cleanResponseText);
    console.log("Resposta limpa:", trainingPlan);
    return trainingPlan;


  } catch (error) {
    console.error('Erro ao chamar a API para gerar o plano de treino:', error);
    throw error; // Lança o erro para ser tratado na função principal
  }
};


// Função que faz o tratamento da resposta da API e guarda registos na bd
const saveTrainingPlanToDatabase = async (trainingPlan, userId) => {
  try {
    console.log("User ID 3: " + userId);  // Adicionando um log para verificar se o userId é válido

    

    // Para cada treino no plano de treino
    for (const treino of trainingPlan.treinos) {
      // 1. Criar o registo de treino_ginasio e AGUARDAR a conclusão
      const treinoGinasio = await databases.createDocument(
        config.databaseId,
        config.treinoGinasioCollectionId,
        ID.unique(),
        {
          user: (await getUserById(userId)).$id, 
          data: treino.data
        }
      );


      // 2. Para cada exercício no treino, criar o registo de exercicio_ginasio_serie
      for (const exercicio of treino.exercicios) {
        await databases.createDocument(
          config.databaseId,
          config.registoTreinoCollectionId, // ID da coleção de exercícios
          ID.unique(), // ID único para cada exercício no treino
          {
            treinoGinasio_id: treinoGinasio.$id, // Referência ao treino
            exercicioGinasio_id: exercicio.id_exercicio,
            serie: exercicio.num_series,
            reps: exercicio.num_reps,
          }
        );
      }
    }

    console.log('Plano de treino salvo com sucesso na base de dados!');
  } catch (error) {
    console.error('Erro ao salvar o plano de treino na base de dados:', error);
    throw error; // Lança o erro para ser tratado na função principal
  }
};


//NUTRICIONISTA

 const generateMealSuggestionsFromGPT = async (date, mealType) => {
  try {
    // 1. Obter os exercícios do dia usando a função existente
    const exercises = await getExercisesForDate(date);

    // 2. Preparar o prompt para enviar ao GPT-3.5 Turbo
    let exercisesDescription = exercises.map(exercise => {
      return `- ${exercise.nome} (Séries: ${exercise.series}, Repetições: ${exercise.reps})`;
    }).join("\n");

    const prompt = `
      O atleta fez os seguintes exercícios hoje:

      ${exercisesDescription}

      Com base nestes exercícios, forneça sugestões de refeições, em português de portugal, para o tipo de refeição '${mealType}'.
      A sugestão deve incluir os seguintes detalhes:
      - Ingredientes e respetivas quantidades/peso(se aplicável)
      - Modo de preparação (se aplicável)
      - Calorias totais
      - Macronutrientes (hidratos de carbono, proteínas e gorduras)

      Responda no seguinte formato:

      Nome:
      -nome do prato  

      Ingredientes:
      - Ingrediente 1
      - Ingrediente 2

      Modo de preparação:
      - Passo 1
      - Passo 2

      Calorias: X kcal
      Macronutrientes: Hidratos: Xg, Proteínas: Xg, Gorduras: Xg
    `;

    // 3. Chamada à API GPT-3.5 Turbo
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Você é um especialista em nutrição desportiva.' },
        { role: 'user', content: prompt }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // 4. Extrair a resposta gerada pelo GPT
    const generatedResponse = response.data.choices[0].message.content;
    console.log(generatedResponse)

    // 5. Retornar a sugestão de refeição gerada
    return generatedResponse;
  } catch (error) {
    console.error("Erro ao gerar sugestões de refeição:", error);
    throw error;
  }
};

 const saveMealSuggestionToDatabase = async (userId, mealType, mealSuggestion) => {
  const todayDate = getTodayDate();

  const mealTypeMapping = {
    'Pequeno-Almoço': 'peqalmoco',
    'Almoço': 'almoco',
    'Jantar': 'jantar',
    'Snacks': 'snack',
  };

  const mealTypeAttribute = mealTypeMapping[mealType];

  if (!mealTypeAttribute) {
    console.error("Tipo de refeição inválido:", mealType);
    return;
  }

  const id = (await getUserById(userId)).$id;
  console.log(id)

  try {
    // 1. Verificar se já existe um registo de refeição para o dia e usuário
    const existingMealRecords = await databases.listDocuments(
      config.databaseId,
      config.planoDeRefeicoesCollectionId,  // ID da coleção plano_de_refeicoes
      [Query.equal('userFrontend', id), Query.equal('data', todayDate)]  // Filtro por usuário e data
    );

    if (existingMealRecords.total === 0) {
      // 2. Se não houver registo, criar um novo
      await databases.createDocument(
        config.databaseId,
        config.planoDeRefeicoesCollectionId,  // ID da coleção plano_de_refeicoes
        ID.unique(),  // Gerar ID único para o registo
        {
          userFrontend: id,  // Relacionamento com o usuário
          data: todayDate,  // Data de hoje
          [mealTypeAttribute]: mealSuggestion,  // A refeição do tipo correspondente
        }
      );
      console.log(`Registo de refeição criado para ${mealType}`);
    } else {
      // 3. Se já houver registo, atualizar o campo específico
      const documentId = existingMealRecords.documents[0].$id;  // Pega o ID do primeiro registo encontrado
      await databases.updateDocument(
        config.databaseId,
        config.planoDeRefeicoesCollectionId,  // ID da coleção plano_de_refeicoes
        documentId,  // ID do documento a ser atualizado
        {
          [mealTypeAttribute]: mealSuggestion,  // Atualiza o campo correspondente à refeição
        }
      );
      console.log(`Registo de refeição atualizado para ${mealType}`);
    }
  } catch (error) {
    console.error("Erro ao salvar ou atualizar a sugestão de refeição:", error);
  }
};

export const generateAndSaveMealSuggestion = async (userId, mealType) => {
  const todayDate = getTodayDate();  // Obter a data de hoje

  try {
        // 1. Verificar se já existe um registo para o tipo de refeição (por exemplo, Pequeno-Almoço)
    const mealTypeMapping = {
      'Pequeno-Almoço': 'peqalmoco',
      'Almoço': 'almoco',
      'Jantar': 'jantar',
      'Snacks': 'snack',
    };

    const mealTypeAttribute = mealTypeMapping[mealType];
    const id = (await getUserById(userId)).$id;
    // Verificar se a refeição já foi salva
      const existingMealRecords = await databases.listDocuments(
      config.databaseId,
      config.planoDeRefeicoesCollectionId,  // ID da coleção plano_de_refeicoes
      [Query.equal('userFrontend', id), Query.equal('data', todayDate)]  // Filtro por usuário e data
    );

    if (existingMealRecords.total > 0 && existingMealRecords.documents[0][mealTypeAttribute]) {
      // Se já existe a refeição salva, não faça nada
      console.log(`Já existe um registo para o ${mealType}. Nenhuma atualização será realizada.`);
      return;  // Não faz nada se já existir o registo
    }
    // 1. Gerar a sugestão de refeição usando GPT
    const mealSuggestion = await generateMealSuggestionsFromGPT(todayDate, mealType);

    // 2. Salvar ou atualizar a sugestão na base de dados
    await saveMealSuggestionToDatabase(userId, mealType, mealSuggestion);

    console.log(`Sugestão de refeição para ${mealType} gerada e salva com sucesso.`);
  } catch (error) {
    console.error("Erro ao gerar e salvar sugestão de refeição:", error);
  }
};

export const getMealSuggestionFromDatabase = async (userId, mealType) => {
  const todayDate = getTodayDate();  // Obter a data de hoje

  const mealTypeMapping = {
    'Pequeno-Almoço': 'peqalmoco',
    'Almoço': 'almoco',
    'Jantar': 'jantar',
    'Snacks': 'snack',
  };

  const mealTypeAttribute = mealTypeMapping[mealType];

  if (!mealTypeAttribute) {
    console.error("Tipo de refeição inválido:", mealType);
    return null;
  }

  try {
    // 1. Buscar o registro de refeição na base de dados para o tipo de refeição
    const id = (await getUserById(userId)).$id;
    const mealRecord = await databases.listDocuments(
      config.databaseId,
      config.planoDeRefeicoesCollectionId,  // ID da coleção plano_de_refeicoes
      [
        Query.equal('userFrontend', id), 
        Query.equal('data', todayDate)
      ]
    );

    if (mealRecord.total > 0) {
      // 2. Retornar a refeição salva
      return mealRecord.documents[0][mealTypeAttribute];
    } else {
      return null;  // Se não houver registo, retorna null
    }
  } catch (error) {
    console.error("Erro ao buscar a refeição na base de dados:", error);
    return null;
  }
};

//RECUPERAÇÃO
// Função para gerar o aconselhamento de recuperação
export const generateRecoveryAdvice = async (userId, userQuestion) => {
  const todayDate= getTodayDate();
  try {
    // 1. Obter as informações do usuário (peso, altura, idade, desporto, posição)
    const user = await getAthleteProfile(userId);
    const { peso, altura, idade, desporto, posicao } = user;

    // 2. Obter a lista de exercícios que o usuário fez no dia
    const exercises = await getExercisesForDate(todayDate);

    // 3. Criar a descrição dos exercícios realizados
    let exercisesDescription = exercises.map(exercise => {
      return `- ${exercise.nome} (Séries: ${exercise.series}, Repetições: ${exercise.reps})`;
    }).join("\n");

    // 4. Preparar o prompt para a OpenAI
    const prompt = `
      Age como um especialista em recuperação desportiva e fala em português de Portugal. Eu sou um atleta com as seguintes informações:
      
      - Idade: ${idade} anos
      - Peso: ${peso} kg
      - Altura: ${altura} cm
      - Desporto: ${desporto}
      - Posição: ${posicao}
      
      Fiz os seguintes exercícios de ginásio hoje:
      ${exercisesDescription}

      E tenho uma pergunta para ti:
      ${userQuestion}

    `;
    console.log(exercisesDescription)

    // 5. Chamar a API do GPT-3.5 Turbo com o prompt
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Você é um especialista em recuperação desportiva.' },
        { role: 'user', content: prompt }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // 6. Extrair e retornar a resposta da IA
    const generatedResponse = response.data.choices[0].message.content;
    return generatedResponse;
  } catch (error) {
    console.error("Erro ao gerar aconselhamento de recuperação:", error);
    throw new Error("Erro ao gerar aconselhamento de recuperação.");
  }
};



  

// Função para testar a API com um prompt simples
export const testOpenAIAPI = async () => {
  const prompt = "Qual é a capital da França?"; // Prompt simples para testar

  try {
    // Enviar a requisição para o novo endpoint de chat da OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions', // Endpoint correto para chat models
      {
        model: 'gpt-3.5-turbo',  // Usar o modelo de chat adequado
        messages: [
          { role: 'user', content: prompt }  // Passando a mensagem no formato adequado
        ],
        max_tokens: 50,  // Limitar a resposta para 50 tokens
        temperature: 0.7,  // Controla a criatividade da resposta
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,  // Autenticação com a chave da API
          'Content-Type': 'application/json',
        },
      }
    );

    // Verifique a resposta antes de tentar acessar o conteúdo
    const generatedText = response.data?.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error('A resposta da API não contém texto gerado.');
    }

    console.log('Texto gerado:', generatedText.trim()); // Verifique se a resposta está presente
    return generatedText.trim();  // Retorna o texto gerado
  } catch (error) {
    console.error('Erro ao chamar a API da OpenAI:', error);
    throw error;  // Lança o erro se houver falha
  }
};

