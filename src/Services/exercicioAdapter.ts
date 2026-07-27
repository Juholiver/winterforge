// services/exercicioAdapter.ts
import type { ExercicioFicha, TreinoBackendItem } from '../types/exercicio';

export const normalizarRepeticoes = (valor?: string): string => {
  return String(valor ?? '10').split(' ')[0].replace(/\D/g, '') || '10';
};

export const extrairDivisao = (nomeTreino?: string): string => {
  const texto = (nomeTreino ?? '').trim().toUpperCase();
  const match = texto.match(/TREINO\s*([A-Z])/);
  return match?.[1] ?? 'A';
};

export const getExercicioId = (item: ExercicioFicha): number => {
  return Number(item.exercicioId ?? item.id);
};

export const removerDuplicados = (itens: ExercicioFicha[]): ExercicioFicha[] => {
  return Array.from(
    new Map(itens.map((item) => [String(getExercicioId(item)), item])).values()
  );
};

export const resolverNomeTreino = (nomeChave: string, exerciciosDoTreino: TreinoBackendItem[]): string => {
  const primeiro = exerciciosDoTreino?.[0];
  const nomeSalvo = primeiro?.nomeTreino ?? primeiro?.exercicio?.nome ?? primeiro?.nomeExercicio ?? '';

  if (nomeSalvo && String(nomeSalvo).trim().length > 0) {
    return String(nomeSalvo).trim();
  }

  const chaveLimpa = String(nomeChave ?? '').trim();
  if (!chaveLimpa) return 'Treino';

  return /^[A-Z]$/.test(chaveLimpa) ? `Treino ${chaveLimpa}` : chaveLimpa;
};

export const mapTreinoBackendToFicha = (item: TreinoBackendItem): ExercicioFicha => {
  if (!item) return {} as ExercicioFicha;

  const treinoId = Number(item.id ?? item.Id ?? item.treinoId ?? item._id ?? Date.now());
  const exercicioId = Number(item.exercicioId ?? item.ExercicioId ?? item.exercicio?.id ?? 0);
  const idUnico = treinoId || exercicioId || Date.now();

  const seriesValue = String(item.series ?? item.Series ?? item.seriesCustom ?? item.seriesRecomendadas ?? '3');
  const repsClean = normalizarRepeticoes(
    String(item.repeticoes ?? item.Repeticoes ?? item.repsCustom ?? item.repeticoesCustom ?? '10')
  );

  return {
    id: idUnico,
    exercicioId,
    treinoId,
    nome: item.nomeExercicio ?? item.NomeExercicio ?? item.nome ?? item.exercicio?.nome ?? 'Exercício',
    grupoMuscular: item.grupoMuscular ?? item.exercicio?.grupoMuscular ?? '',
    equipamento: item.equipamento ?? item.exercicio?.equipamento ?? '',
    nivel: item.nivel ?? item.exercicio?.nivel ?? '',
    seriesRecomendadas: seriesValue,
    repeticoes: repsClean,
    gif: item.gif ?? item.exercicio?.gif ?? '',
    seriesCustom: seriesValue,
    repsCustom: repsClean,
  };
};