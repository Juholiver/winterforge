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

export interface ExercicioFicha extends Exercicio {
  seriesCustom: string | number;
  repsCustom: string | number;
}

export interface TreinoSalvo {
  id: number;
  nome: string;
  data: string;
  exercicios: ExercicioFicha[];
}

export type CampoSerieReps = 'seriesCustom' | 'repsCustom';
