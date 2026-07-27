import type { ExercicioFicha, TreinoBackendItem } from '../types/exercicio';

export const normalizarRepeticoes = (valor?: string | number): string => {
  return String(valor ?? '10').split(' ')[0].replace(/\D/g, '') || '10';
};

export const extrairDivisao = (nomeTreino?: string): string => {
  const texto = (nomeTreino ?? '').trim().toUpperCase();
  const match = texto.match(/TREINO\s*([A-Z])/);
  return match?.[1] ?? 'A';
};

export const getExercicioId = (item: ExercicioFicha): number => {
  return item.exercicioId ?? item.id;
};

export const removerDuplicados = (itens: ExercicioFicha[]): ExercicioFicha[] => {
  return Array.from(
    new Map(itens.map((item) => [getExercicioId(item), item])).values()
  );
};

export const resolverNomeTreino = (nomeChave: string): string => {
  const chaveLimpa = String(nomeChave ?? '').trim();
  if (!chaveLimpa) return 'Treino A';

  return /^[A-Z]$/.test(chaveLimpa) ? `Treino ${chaveLimpa}` : chaveLimpa;
};

export const mapTreinoBackendToFicha = (item: TreinoBackendItem): ExercicioFicha => {
  const seriesStr = String(item.series ?? '3');
  const repsClean = normalizarRepeticoes(item.repeticoes);

  return {
    id: item.id,
    exercicioId: item.exercicioId,
    treinoId: item.id,
    nome: item.nomeExercicio ?? item.exercicio?.nome ?? 'Exercício',
    grupoMuscular: item.exercicio?.grupoMuscular ?? '',
    equipamento: item.exercicio?.equipamento ?? '',
    nivel: item.exercicio?.nivel ?? '',
    seriesRecomendadas: seriesStr,
    repeticoes: repsClean,
    gif: item.exercicio?.gif ?? '',
    seriesCustom: seriesStr,
    repsCustom: repsClean,
  };
};