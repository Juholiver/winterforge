export type ExerciseId = number | string;

export interface Exercicio {
  id: ExerciseId;
  nome?: string;
  grupoMuscular?: string;
  equipamento?: string;
  nivel?: string;
  seriesRecomendadas?: string | number;
  repeticoes?: string | number;
  gif?: string;
}

export interface TreinoBackendItem {
  id?: number | string;
  Id?: number | string;
  treinoId?: number | string;
  _id?: number | string;
  exercicioId?: number | string;
  ExercicioId?: number | string;
  nomeTreino?: string;
  nomeExercicio?: string;
  NomeExercicio?: string;
  nome?: string;
  grupoMuscular?: string;
  equipamento?: string;
  nivel?: string;
  series?: number | string;
  Series?: number | string;
  seriesCustom?: number | string;
  seriesRecomendadas?: number | string;
  repeticoes?: number | string;
  Repeticoes?: number | string;
  repsCustom?: number | string;
  repeticoesCustom?: number | string;
  gif?: string;
  exercicio?: {
    id?: number | string;
    nome?: string;
    grupoMuscular?: string;
    equipamento?: string;
    nivel?: string;
    gif?: string;
  };
}

export interface ExercicioFicha extends Exercicio {
  id: number;
  exercicioId: number;
  seriesCustom: string;
  repsCustom: string;
}

export interface TreinoSalvo {
  id: number;
  nome: string;
  data: string;
  exercicios: ExercicioFicha[];
}

export type CampoSerieReps = 'seriesCustom' | 'repsCustom';
