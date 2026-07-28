import axios from 'axios';

// Pega a URL configurada no seu .env
const API_URL = import.meta.env.VITE_API_URL;

export interface ExercicioApi {
  id: string | number;
  nome: string;
  grupoMuscular?: string;
  gifUrl?: string;
  gif?: string;
}

/**
 * Busca o exercício por ID para pegar o GIF
 */
export const getGifPorId = async (id: string | number): Promise<string | null> => {
  try {
    const response = await axios.get<ExercicioApi>(`${API_URL}/${id}`);
    return response.data.gifUrl || response.data.gif || null;
  } catch (error) {
    console.error(`Erro ao buscar GIF do exercício ID ${id}:`, error);
    return null;
  }
};

/**
 * Busca na lista de exercícios por NOME para pegar o GIF
 */
export const getGifPorNome = async (nomeExercicio: string): Promise<string | null> => {
  try {
    const response = await axios.get<ExercicioApi[]>(API_URL);
    const exercicio = response.data.find(
      (item) => item.nome.trim().toLowerCase() === nomeExercicio.trim().toLowerCase()
    );

    return exercicio ? (exercicio.gifUrl || exercicio.gif || null) : null;
  } catch (error) {
    console.error(`Erro ao buscar GIF do exercício "${nomeExercicio}":`, error);
    return null;
  }
};