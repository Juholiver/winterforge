// Components/Filtros/FiltrosExercicios.tsx
interface FiltrosExerciciosProps {
  busca: string;
  onBuscaChange: (val: string) => void;
  grupoSelecionado: string;
  onGrupoSelect: (grupo: string) => void;
  nivelSelecionado: string;
  onNivelSelect: (nivel: string) => void;
  gruposMusculares: string[];
  niveis: string[];
}

export function FiltrosExercicios({
  busca,
  onBuscaChange,
  grupoSelecionado,
  onGrupoSelect,
  nivelSelecionado,
  onNivelSelect,
  gruposMusculares,
  niveis,
}: FiltrosExerciciosProps) {
  return (
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
          onChange={(e) => onBuscaChange(e.target.value)}
        />
      </div>

      <div className="wolf-filter-group">
        <span className="wolf-filter-label">Grupo Muscular:</span>
        <div className="wolf-chips-container">
          {gruposMusculares.map((grupo) => (
            <button
              key={grupo}
              className={`wolf-chip ${grupoSelecionado === grupo ? 'active' : ''}`}
              onClick={() => onGrupoSelect(grupo)}
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
              onClick={() => onNivelSelect(nivel)}
            >
              {nivel}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}