import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import ExerciseCard from '../../Components/Cards/ExerciseCard';
import FichaTreinoDrawer from '../../Components/FichaTreino/FichaTreinoDrawer';
import { useAuth } from '../../Context/AuthContext';

import {
  getTreinos,
  criarTreino,
  deletarTreino,
} from '../../Services/treinoService';

import './ListaExercicios.css';

import type {
  CampoSerieReps,
  Exercicio,
  ExercicioFicha,
  TreinoSalvo,
} from '../../types/exercicio';

type ExercicioFichaComTreino = ExercicioFicha & {
  exercicioId?: number;
  treinoId?: number;
};

type TreinoBackendItem = {
  id?: number | string;
  Id?: number | string;
  treinoId?: number | string;
  _id?: number | string;
  exercicioId?: number | string;
  ExercicioId?: number | string;
  nomeExercicio?: string;
  NomeExercicio?: string;
  nome?: string;
  exercicio?: {
    id?: number | string;
    nome?: string;
    grupoMuscular?: string;
    equipamento?: string;
    nivel?: string;
    gif?: string;
  };
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
};

const mapTreinoBackendToFicha = (item: TreinoBackendItem): ExercicioFichaComTreino => {
  if (!item) return {} as ExercicioFichaComTreino;

  const treinoId = Number(
    item.id ?? item.Id ?? item.treinoId ?? item._id ?? Date.now()
  );

  const exercicioId = Number(
    item.exercicioId ?? item.ExercicioId ?? item.exercicio?.id ?? 0
  );

  const idUnico = treinoId || exercicioId || Date.now();

  const seriesValue = String(
    item.series ??
      item.Series ??
      item.seriesCustom ??
      item.seriesRecomendadas ??
      '3'
  );

  const repsRaw = String(
    item.repeticoes ??
      item.Repeticoes ??
      item.repsCustom ??
      item.repeticoesCustom ??
      '10'
  );
  const repsClean = repsRaw.split(' ')[0].replace(/\D/g, '') || '10';

  return {
    id: idUnico,
    exercicioId,
    treinoId,
    nome:
      item.nomeExercicio ??
      item.NomeExercicio ??
      item.nome ??
      item.exercicio?.nome ??
      'Exercício',
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

const extrairDivisao = (nomeTreino?: string) => {
  const texto = (nomeTreino ?? '').trim().toUpperCase();
  const match = texto.match(/TREINO\s*([A-Z])/);
  return match?.[1] ?? 'A';
};

const normalizarRepeticoes = (valor?: string) => {
  return String(valor ?? '10')
    .split(' ')[0]
    .replace(/\D/g, '') || '10';
};

const getExercicioId = (item: ExercicioFicha) => {
  return Number((item as ExercicioFichaComTreino).exercicioId ?? item.id);
};

const removerDuplicados = (itens: ExercicioFicha[]) => {
  return Array.from(
    new Map(itens.map((item) => [String(getExercicioId(item)), item])).values()
  );
};

const resolverNomeTreino = (nomeChave: string, exerciciosDoTreino: TreinoBackendItem[]) => {
  const primeiro = exerciciosDoTreino?.[0];

  const nomeSalvo =
    primeiro?.nomeTreino ??
    (primeiro as any)?.NomeTreino ??
    primeiro?.exercicio?.nome ??
    primeiro?.nomeExercicio ??
    primeiro?.NomeExercicio ??
    '';

  if (nomeSalvo && String(nomeSalvo).trim().length > 0) {
    return String(nomeSalvo).trim();
  }

  const chaveLimpa = String(nomeChave ?? '').trim();
  if (!chaveLimpa) return 'Treino';

  if (/^[A-Z]$/.test(chaveLimpa)) {
    return `Treino ${chaveLimpa}`;
  }

  return chaveLimpa;
};

export default function ListaExerciciosBanco() {
  const { isAuthenticated } = useAuth();

  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [ficha, setFicha] = useState<ExercicioFicha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historicoTreinos, setHistoricoTreinos] = useState<TreinoSalvo[]>([]);
  const [loadingTreinos, setLoadingTreinos] = useState(false);

  const [busca, setBusca] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState('Todos');
  const [nivelSelecionado, setNivelSelecionado] = useState('Todos');

  const API_EXERCICIOS_URL = import.meta.env.VITE_API_URL;

  const gruposMusculares = [
    'Todos',
    'Peito',
    'Costas',
    'Pernas',
    'Ombros',
    'Braços',
    'Tríceps',
    'Bíceps',
  ];

  const niveis = ['Todos', 'Iniciante', 'Intermediário', 'Avançado'];

  const handleCarregarTreinos = useCallback(async (): Promise<TreinoSalvo[]> => {
    try {
      setLoadingTreinos(true);

      const responseTreinos = await getTreinos();

      if (!responseTreinos?.success || !responseTreinos?.data) {
        setHistoricoTreinos([]);
        setFicha([]);
        return [];
      }

      const dataBackend = responseTreinos.data;

      const gruposTreino: Record<string, TreinoBackendItem[]> = Array.isArray(dataBackend)
        ? { Treino: dataBackend as TreinoBackendItem[] }
        : typeof dataBackend === 'object' && dataBackend !== null
          ? (dataBackend as Record<string, TreinoBackendItem[]>)
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

      const fichaSemDuplicados = removerDuplicados(todosExerciciosFicha);

      setFicha(fichaSemDuplicados);
      setHistoricoTreinos(historicoMapeado);

      return historicoMapeado;
    } catch (err) {
      console.error('Erro ao carregar treinos salvos do banco:', err);
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

        if (!API_EXERCICIOS_URL) {
          throw new Error('VITE_API_URL não configurado.');
        }

        const responseExercicios = await axios.get<Exercicio[]>(API_EXERCICIOS_URL);
        setExercicios(responseExercicios.data);

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
  }, [API_EXERCICIOS_URL, isAuthenticated, handleCarregarTreinos]);

  // Remove só da ficha atual, sem apagar do banco
  const handleRemoverFicha = (id: ExercicioFicha['id']) => {
    setFicha((prev) =>
      prev.filter(
        (item) => Number((item as ExercicioFichaComTreino).exercicioId ?? item.id) !== Number(id)
      )
    );
  };

  // Limpa só a ficha atual, sem apagar do banco
  const handleLimparFicha = () => {
    setFicha([]);
  };

  const handleAtualizarSerieReps = (
    id: ExercicioFicha['id'],
    campo: CampoSerieReps,
    valor: string
  ) => {
    setFicha((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [campo]: valor } : item))
    );
  };

  const handleCarregarFichaCompleta = (treino: ExercicioFicha[]) => {
    const fichaCarregada = treino.map((item) => ({
      ...item,
      seriesCustom: item.seriesCustom ?? item.seriesRecomendadas ?? '3',
      repsCustom: item.repsCustom ?? item.repeticoes ?? '10',
    }));

    setFicha(fichaCarregada);
  };

  const handleAdicionarFicha = (exercicio: Exercicio) => {
    const jaExiste = ficha.some(
      (item) =>
        Number((item as ExercicioFichaComTreino).exercicioId ?? item.id) === Number(exercicio.id)
    );

    if (jaExiste) return;

    const novoItem: ExercicioFichaComTreino = {
      ...exercicio,
      id: Number(exercicio.id),
      exercicioId: Number(exercicio.id),
      nome: exercicio.nome ?? 'Exercício',
      seriesRecomendadas: String(exercicio.seriesRecomendadas ?? '3'),
      repeticoes: String(exercicio.repeticoes ?? '10'),
      seriesCustom: String(exercicio.seriesRecomendadas ?? '3'),
      repsCustom: String(exercicio.repeticoes ?? '10'),
    };

    setFicha((prev) => [...prev, novoItem]);
  };

  const handleSalvarFicha = async (
    nomeTreino: string,
    exerciciosSave: ExercicioFicha[]
  ) => {
    const nomeFinal = nomeTreino.trim();

    if (!nomeFinal) {
      alert('Digite um nome para o treino.');
      return;
    }

    if (!exerciciosSave.length) {
      alert('Adicione exercícios antes de salvar.');
      return;
    }

    const divisao = extrairDivisao(nomeFinal);
    const exerciciosUnicos = removerDuplicados(exerciciosSave);

    try {
      await Promise.all(
        exerciciosUnicos.map((item) => {
          const payload = {
            exercicioId: getExercicioId(item),
            nomeExercicio: item.nome ?? 'Exercício',
            divisao,
            series: Number(item.seriesCustom ?? item.seriesRecomendadas ?? 3) || 3,
            repeticoes: normalizarRepeticoes(item.repsCustom ?? item.repeticoes),
            carga: '0',
            descanso: '60s',
          };

          return criarTreino(payload);
        })
      );

      setFicha([]);
      await handleCarregarTreinos();
    } catch (error) {
      console.error('Erro ao salvar ficha:', error);
      alert('Não foi possível salvar a ficha.');
    }
  };

  const handleDeleteTreino = async (id: number) => {
    await deletarTreino(id);
    await handleCarregarTreinos();
  };

  const exerciciosFiltrados = useMemo(() => {
    if (!Array.isArray(exercicios)) return [];

    const buscaNormalizada = busca.toLowerCase();

    return exercicios.filter((ex) => {
      const nomeEx = ex.nome?.toLowerCase() ?? '';
      const bateComBusca = nomeEx.includes(buscaNormalizada);
      const bateComGrupo =
        grupoSelecionado === 'Todos' || ex.grupoMuscular === grupoSelecionado;
      const bateComNivel =
        nivelSelecionado === 'Todos' || ex.nivel === nivelSelecionado;

      return bateComBusca && bateComGrupo && bateComNivel;
    });
  }, [exercicios, busca, grupoSelecionado, nivelSelecionado]);

  return (
    <div className="wolf-page-container">
      <header className="wolf-header">
        <h1 className="wolf-title">
          MINHA FICHA DE <span>TREINOS</span>
        </h1>
        <p className="wolf-subtitle">
          Monte e sincronize seu plano de treino na nuvem.
        </p>
      </header>

      <section className="wolf-hero-ficha-wrapper">
        <FichaTreinoDrawer
          exerciciosFicha={ficha}
          onRemover={handleRemoverFicha}
          onLimpar={handleLimparFicha}
          onAtualizarSerieReps={handleAtualizarSerieReps}
          onCarregarFichaCompleta={handleCarregarFichaCompleta}
          mode="database"
          treinosSalvos={historicoTreinos}
          loadingTreinos={loadingTreinos}
          onSalvarFicha={handleSalvarFicha}
          onDeleteTreino={handleDeleteTreino}
          onCarregarTreinos={handleCarregarTreinos}
        />
      </section>

      <section className="wolf-filter-panel">
        <div className="wolf-search-box">
          <svg viewBox="0 0 24 24" fill="currentColor" className="wolf-search-icon">
            <path d="M10 2a8 8 0 016.32 12.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 1110 2zm0 2a6 6 0 100 12 6 6 0 000-12z" />
          </svg>
          <input
            type="text"
            className="wolf-search-input"
            placeholder="Buscar por nome do exercício..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="wolf-filter-group">
          <span className="wolf-filter-label">Grupo Muscular:</span>
          <div className="wolf-chips-container">
            {gruposMusculares.map((grupo) => (
              <button
                key={grupo}
                className={`wolf-chip ${grupoSelecionado === grupo ? 'active' : ''}`}
                onClick={() => setGrupoSelecionado(grupo)}
              >
                {grupo}
              </button>
            ))}
          </div>
        </div>

        <div className="wolf-filter-group">
          <span className="wolf-filter-label">Nível:</span>
          <div className="wolf-chips-container">
            {niveis.map((nivel) => (
              <button
                key={nivel}
                className={`wolf-chip ${nivelSelecionado === nivel ? 'active' : ''}`}
                onClick={() => setNivelSelecionado(nivel)}
              >
                {nivel}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="wolf-content-wrapper">
        <main className="wolf-grid-container">
          {loading && (
            <div className="wolf-no-results">
              <p>Carregando exercícios...</p>
            </div>
          )}

          {error && !loading && (
            <div className="wolf-no-results" style={{ color: '#ef4444' }}>
              <p>{error}</p>
            </div>
          )}

          {!loading &&
            !error &&
            exerciciosFiltrados.length > 0 &&
            exerciciosFiltrados.map((exercicio) => {
              const estaNaFicha = ficha.some(
                (f) =>
                  Number((f as ExercicioFichaComTreino).exercicioId ?? f.id) ===
                  Number(exercicio.id)
              );

              return (
                <div key={String(exercicio.id)} className="wolf-card-item-container">
                  <ExerciseCard exercicio={exercicio} />
                  <button
                    className={`wolf-btn-add-card ${estaNaFicha ? 'added' : ''}`}
                    onClick={() => handleAdicionarFicha(exercicio)}
                    disabled={estaNaFicha}
                  >
                    {estaNaFicha ? '✓ Na Ficha' : '+ Adicionar à Ficha'}
                  </button>
                </div>
              );
            })}

          {!loading && !error && exerciciosFiltrados.length === 0 && (
            <div className="wolf-no-results">
              <p>Nenhum exercício encontrado com os filtros aplicados.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}