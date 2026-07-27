import { useMemo, useState } from 'react';
import ExerciseCard from '../../Components/Cards/ExerciseCard';
import FichaTreinoDrawer from '../../Components/FichaTreino/FichaTreinoDrawer';
import { FiltrosExercicios } from '../../Components/Filtros/FiltrosExercicios';
import { useTreinos } from '../../Hooks/useTreinos';
import { getExercicioId } from '../../Services/exercicioAdapter';

import './ListaExercicios.css';

const GRUPOS_MUSCULARES = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Tríceps', 'Bíceps'];
const NIVEIS = ['Todos', 'Iniciante', 'Intermediário', 'Avançado'];

export default function ListaExerciciosBanco() {
  const { exercicios, ficha, historicoTreinos, loading, loadingTreinos, error, actions } = useTreinos();

  const [busca, setBusca] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState('Todos');
  const [nivelSelecionado, setNivelSelecionado] = useState('Todos');

  const exerciciosFiltrados = useMemo(() => {
    if (!Array.isArray(exercicios)) return [];
    const buscaNormalizada = busca.toLowerCase();

    return exercicios.filter((ex) => {
      const bateComBusca = (ex.nome?.toLowerCase() ?? '').includes(buscaNormalizada);
      const bateComGrupo = grupoSelecionado === 'Todos' || ex.grupoMuscular === grupoSelecionado;
      const bateComNivel = nivelSelecionado === 'Todos' || ex.nivel === nivelSelecionado;

      return bateComBusca && bateComGrupo && bateComNivel;
    });
  }, [exercicios, busca, grupoSelecionado, nivelSelecionado]);

  return (
    <div className="wolf-page-container">
      <header className="wolf-header">
        <h1 className="wolf-title">
          MINHA FICHA DE <span>TREINOS</span>
        </h1>
        <p className="wolf-subtitle">Monte e sincronize seu plano de treino na nuvem.</p>
      </header>

      <section className="wolf-hero-ficha-wrapper">
        <FichaTreinoDrawer
          exerciciosFicha={ficha}
          onRemover={actions.removerFicha}
          onLimpar={actions.limparFicha}
          onAtualizarSerieReps={actions.atualizarSerieReps}
          onCarregarFichaCompleta={actions.carregarFichaCompleta}
          mode="database"
          treinosSalvos={historicoTreinos}
          loadingTreinos={loadingTreinos}
          onSalvarFicha={actions.salvarFicha}
          onDeleteTreino={actions.deleteTreino}
          onCarregarTreinos={actions.carregarTreinos}
        />
      </section>

      <FiltrosExercicios
        busca={busca}
        onBuscaChange={setBusca}
        grupoSelecionado={grupoSelecionado}
        onGrupoSelect={setGrupoSelecionado}
        nivelSelecionado={nivelSelecionado}
        onNivelSelect={setNivelSelecionado}
        gruposMusculares={GRUPOS_MUSCULARES}
        niveis={NIVEIS}
      />

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
            exerciciosFiltrados.map((exercicio) => {
              const estaNaFicha = ficha.some(
                (itemFicha) => getExercicioId(itemFicha) === Number(exercicio.id)
              );

              return (
                <div key={String(exercicio.id)} className="wolf-card-item-container">
                  <ExerciseCard exercicio={exercicio} />
                  <button
                    className={`wolf-btn-add-card ${estaNaFicha ? 'added' : ''}`}
                    onClick={() => actions.adicionarFicha(exercicio)}
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