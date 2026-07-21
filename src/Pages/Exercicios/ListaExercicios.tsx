import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import ExerciseCard from '../../Components/Cards/ExerciseCard';
import FichaTreinoDrawer from '../../Components/FichaTreino/FichaTreinoDrawer';
import './ListaExercicios.css';
import type { CampoSerieReps, Exercicio, ExercicioFicha } from '../../types/exercicio';

export default function ListaExercicios() {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ficha, setFicha] = useState<ExercicioFicha[]>(() => {
    if (typeof window === 'undefined') return [];

    const salvo = window.localStorage.getItem('@wolf:fichaTreino');
    if (!salvo) return [];

    try {
      return JSON.parse(salvo) as ExercicioFicha[];
    } catch {
      return [];
    }
  });

  const [busca, setBusca] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState('Todos');
  const [nivelSelecionado, setNivelSelecionado] = useState('Todos');

  const gruposMusculares = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Tríceps', 'Bíceps'];
  const niveis = ['Todos', 'Iniciante', 'Intermediário', 'Avançado'];

  useEffect(() => {
    const fetchExercicios = async () => {
      try {
        setLoading(true);
        setError(null);
        const API_URL = import.meta.env.VITE_API_URL;

        if (!API_URL) {
          throw new Error('VITE_API_URL não configurado');
        }

        const response = await axios.get<Exercicio[]>(API_URL);
        setExercicios(response.data);
      } catch (err) {
        console.error('Erro ao buscar exercícios:', err);
        setError('Não foi possível carregar os exercícios. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchExercicios();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('@wolf:fichaTreino', JSON.stringify(ficha));
    }
  }, [ficha]);

  const handleAdicionarFicha = (exercicio: Exercicio) => {
    const jaExiste = ficha.some((item) => item.id === exercicio.id);
    if (jaExiste) return;

    const novoItem: ExercicioFicha = {
      ...exercicio,
      seriesCustom: exercicio.seriesRecomendadas ?? '3',
      repsCustom: exercicio.repeticoes ?? '10',
    };

    setFicha((prev) => [...prev, novoItem]);
  };

  const handleRemoverFicha = (id: ExercicioFicha['id']) => {
    setFicha((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLimparFicha = () => {
    setFicha([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('@wolf:fichaTreino');
    }
  };

  const handleAtualizarSerieReps = (id: ExercicioFicha['id'], campo: CampoSerieReps, valor: string) => {
    setFicha((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [campo]: valor } : item
      )
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

  const exerciciosFiltrados = useMemo(() => {
    if (!Array.isArray(exercicios)) return [];

    return exercicios.filter((ex) => {
      const nomeEx = ex.nome?.toLowerCase() ?? '';
      const bateComBusca = nomeEx.includes(busca.toLowerCase());

      const bateComGrupo = grupoSelecionado === 'Todos' || ex.grupoMuscular === grupoSelecionado;
      const bateComNivel = nivelSelecionado === 'Todos' || ex.nivel === nivelSelecionado;

      return bateComBusca && bateComGrupo && bateComNivel;
    });
  }, [exercicios, busca, grupoSelecionado, nivelSelecionado]);

  return (
    <div className="wolf-page-container">
      <header className="wolf-header">
        <h1 className="wolf-title">
          BIBLIOTECA DE <span>EXERCÍCIOS</span>
        </h1>
        <p className="wolf-subtitle">Explore, filtre e monte seus treinos com precisão.</p>
      </header>

      <section className="wolf-hero-ficha-wrapper">
        <FichaTreinoDrawer
          exerciciosFicha={ficha}
          onRemover={handleRemoverFicha}
          onLimpar={handleLimparFicha}
          onAtualizarSerieReps={handleAtualizarSerieReps}
          onCarregarFichaCompleta={handleCarregarFichaCompleta}
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

          {!loading && !error && exerciciosFiltrados.length > 0 && (
            exerciciosFiltrados.map((exercicio) => {
              const estaNaFicha = ficha.some((f) => f.id === exercicio.id);
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
            })
          )}

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