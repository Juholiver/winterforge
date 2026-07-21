import  { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ExerciseCard from "../../Components/Cards/ExerciseCard";
import './ListaExercicios.css';

export default function ListaExercicios() {
  const [exercicios, setExercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados dos Filtros
  const [busca, setBusca] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState('Todos');
  const [nivelSelecionado, setNivelSelecionado] = useState('Todos');

  const gruposMusculares = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Tríceps', 'Bíceps'];
  const niveis = ['Todos', 'Iniciante', 'Intermediário', 'Avançado'];

  // Consumindo o Endpoint com Axios
  useEffect(() => {
    const fetchExercicios = async () => {
      try {
        setLoading(true);
        // Pegando a URL da variável do .env
        const API_URL = import.meta.env.VITE_API_URL; 
        
        const response = await axios.get(API_URL);
        
        // Se a resposta for um array direto ou vier dentro de .data
        setExercicios(response.data);
      } catch (err) {
        console.error("Erro ao buscar exercícios:", err);
        setError("Não foi possível carregar os exercícios. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchExercicios();
  }, []);

  // Lógica de Filtragem no Front-end
  const exerciciosFiltrados = useMemo(() => {
    if (!Array.isArray(exercicios)) return [];

    return exercicios.filter((ex) => {
      const nomeEx = ex.nome ? ex.nome.toLowerCase() : '';
      const bateComBusca = nomeEx.includes(busca.toLowerCase());
      
      const bateComGrupo = grupoSelecionado === 'Todos' || ex.grupoMuscular === grupoSelecionado;
      const bateComNivel = nivelSelecionado === 'Todos' || ex.nivel === nivelSelecionado;

      return bateComBusca && bateComGrupo && bateComNivel;
    });
  }, [exercicios, busca, grupoSelecionado, nivelSelecionado]);

  return (
    <div className="wolf-page-container">
      {/* Cabeçalho */}
      <header className="wolf-header">
        <h1 className="wolf-title">
          BIBLIOTECA DE <span>EXERCÍCIOS</span>
        </h1>
        <p className="wolf-subtitle">Explore, filtre e monte seus treinos com precisão.</p>
      </header>

      {/* Painel de Filtros */}
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

        {/* Filtro por Grupo */}
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

        {/* Filtro por Nível */}
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

      {/* Grid com Estados de Loading, Erro e Sucesso */}
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
          exerciciosFiltrados.map((exercicio) => (
            <ExerciseCard key={exercicio.id} exercicio={exercicio} />
          ))
        )}

        {!loading && !error && exerciciosFiltrados.length === 0 && (
          <div className="wolf-no-results">
            <p>Nenhum exercício encontrado com os filtros aplicados.</p>
          </div>
        )}
      </main>
    </div>
  );
}