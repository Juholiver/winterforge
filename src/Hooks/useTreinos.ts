// hooks/useTreinos.ts
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';
import { getTreinos, criarTreino, deletarTreino } from '../Services/treinoService';
import {
  mapTreinoBackendToFicha,
  resolverNomeTreino,
  removerDuplicados,
  extrairDivisao,
  normalizarRepeticoes,
  getExercicioId,
} from '../services/exercicioAdapter';
import type { Exercicio, ExercicioFicha, TreinoSalvo, CampoSerieReps, TreinoBackendItem } from '../types/exercicio';

const API_EXERCICIOS_URL = import.meta.env.VITE_API_URL;

export function useTreinos() {
  const { isAuthenticated } = useAuth();
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [ficha, setFicha] = useState<ExercicioFicha[]>([]);
  const [historicoTreinos, setHistoricoTreinos] = useState<TreinoSalvo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTreinos, setLoadingTreinos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCarregarTreinos = useCallback(async (): Promise<TreinoSalvo[]> => {
    try {
      setLoadingTreinos(true);
      const response = await getTreinos();

      if (!response?.success || !response?.data) {
        setHistoricoTreinos([]);
        setFicha([]);
        return [];
      }

      const dataBackend = response.data;
      const gruposTreino: Record<string, TreinoBackendItem[]> = Array.isArray(dataBackend)
        ? { Treino: dataBackend }
        : typeof dataBackend === 'object' && dataBackend !== null
        ? dataBackend
        : {};

      const historicoMapeado: TreinoSalvo[] = [];
      const todosExerciciosFicha: ExercicioFicha[] = [];

      Object.entries(gruposTreino).forEach(([nomeTreino, exerciciosDoTreino]) => {
        if (!Array.isArray(exerciciosDoTreino) || exerciciosDoTreino.length === 0) return;

        const exerciciosFormatados = exerciciosDoTreino.map(mapTreinoBackendToFicha);
        const nomeFinal = resolverNomeTreino(nomeTreino, exerciciosDoTreino);

        todosExerciciosFicha.push(...exerciciosFormatados);
        historicoMapeado.push({
          id: exerciciosFormatados[0]?.treinoId ?? Date.now(),
          nome: nomeFinal,
          data: new Date().toLocaleDateString('pt-BR'),
          exercicios: exerciciosFormatados,
        });
      });

      setFicha(removerDuplicados(todosExerciciosFicha));
      setHistoricoTreinos(historicoMapeado);
      return historicoMapeado;
    } catch (err) {
      console.error('Erro ao carregar treinos:', err);
      setHistoricoTreinos([]);
      setFicha([]);
      return [];
    } finally {
      setLoadingTreinos(false);
    }
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!API_EXERCICIOS_URL) throw new Error('VITE_API_URL não configurado.');

        const response = await axios.get<Exercicio[]>(API_EXERCICIOS_URL);
        setExercicios(response.data);

        if (isAuthenticated) {
          await handleCarregarTreinos();
        } else {
          setFicha([]);
          setHistoricoTreinos([]);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os exercícios.');
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [isAuthenticated, handleCarregarTreinos]);

  const handleRemoverFicha = (id: number) => {
    setFicha((prev) => prev.filter((item) => getExercicioId(item) !== id));
  };

  const handleLimparFicha = () => setFicha([]);

  const handleAtualizarSerieReps = (id: ExercicioFicha['id'], campo: CampoSerieReps, valor: string) => {
    setFicha((prev) => prev.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)));
  };

  const handleCarregarFichaCompleta = (treino: ExercicioFicha[]) => {
    setFicha(
      treino.map((item) => ({
        ...item,
        seriesCustom: item.seriesCustom ?? item.seriesRecomendadas ?? '3',
        repsCustom: item.repsCustom ?? item.repeticoes ?? '10',
      }))
    );
  };

  const handleAdicionarFicha = (exercicio: Exercicio) => {
    const novoId = Number(exercicio.id) || Date.now();
    const jaExiste = ficha.some((item) => getExercicioId(item) === novoId);
    if (jaExiste) return;

    const novoItem: ExercicioFicha = {
      ...exercicio,
      id: novoId,
      exercicioId: novoId,
      nome: exercicio.nome ?? 'Exercício',
      seriesRecomendadas: String(exercicio.seriesRecomendadas ?? '3'),
      repeticoes: String(exercicio.repeticoes ?? '10'),
      seriesCustom: String(exercicio.seriesRecomendadas ?? '3'),
      repsCustom: String(exercicio.repeticoes ?? '10'),
    };

    setFicha((prev) => [...prev, novoItem]);
  };

  const handleSalvarFicha = async (nomeTreino: string, exerciciosSave: ExercicioFicha[]) => {
    const nomeFinal = nomeTreino.trim();
    if (!nomeFinal) return alert('Digite um nome para o treino.');
    if (!exerciciosSave.length) return alert('Adicione exercícios antes de salvar.');

    const divisao = extrairDivisao(nomeFinal);
    const exerciciosUnicos = removerDuplicados(exerciciosSave);

    try {
      await Promise.all(
        exerciciosUnicos.map((item) =>
          criarTreino({
            exercicioId: getExercicioId(item),
            nomeExercicio: item.nome ?? 'Exercício',
            divisao,
            series: Number(item.seriesCustom ?? item.seriesRecomendadas ?? 3) || 3,
            repeticoes: normalizarRepeticoes(item.repsCustom ?? item.repeticoes),
            carga: '0',
            descanso: '60s',
          })
        )
      );

      setFicha([]);
      await handleCarregarTreinos();
    } catch (err) {
      console.error('Erro ao salvar ficha:', err);
      alert('Não foi possível salvar a ficha.');
    }
  };

  const handleDeleteTreino = async (id: number) => {
    await deletarTreino(id);
    await handleCarregarTreinos();
  };

  return {
    exercicios,
    ficha,
    historicoTreinos,
    loading,
    loadingTreinos,
    error,
    actions: {
      removerFicha: handleRemoverFicha,
      limparFicha: handleLimparFicha,
      atualizarSerieReps: handleAtualizarSerieReps,
      carregarFichaCompleta: handleCarregarFichaCompleta,
      adicionarFicha: handleAdicionarFicha,
      salvarFicha: handleSalvarFicha,
      deleteTreino: handleDeleteTreino,
      carregarTreinos: handleCarregarTreinos,
    },
  };
}