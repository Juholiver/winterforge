// types/exercicio.ts

export type ExerciseId = number;

// Modelo do banco de dados/API para um treino salvo
export interface TreinoBackendItem {
  id: number;
  usuarioId?: number;
  exercicioId: number;
  divisao: string; // "A", "B", "C", etc.
  nomeExercicio: string;
  series: number;
  repeticoes: string;
  carga?: string;
  descanso?: string;
  exercicio?: Exercicio;
}

// Exercício genérico (do catálogo de exercícios)
export interface Exercicio {
  id: ExerciseId;
  nome: string;
  grupoMuscular?: string;
  equipamento?: string;
  nivel?: string;
  seriesRecomendadas?: string | number;
  repeticoes?: string | number;
  gif?: string;
}

// Exercício quando está montado na Ficha local (Drawer)
export interface ExercicioFicha extends Exercicio {
  id: number;
  exercicioId: number;
  treinoId?: number;
  seriesCustom: string;
  repsCustom: string;
}

// Ficha agrupada por divisão (O objeto vindo de "Data" do GET /api/treinos)
// Exemplo: { "A": [TreinoBackendItem], "B": [TreinoBackendItem] }
export type FichaAgrupadaData = Record<string, TreinoBackendItem[]>;

// Representação de uma ficha no Histórico
export interface TreinoSalvo {
  id: number;
  nome: string; // Ex: "Treino A"
  data: string;
  exercicios: ExercicioFicha[];
}

export type CampoSerieReps = 'seriesCustom' | 'repsCustom';

// Payload para criar exercício
export interface TreinoCriarData {
  exercicioId: number;
  nomeExercicio: string;
  divisao: string;
  series: number;
  repeticoes: string;
  carga: string;
  descanso: string;
}

// Resposta Padrão da API (.NET BaseApiController)
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}