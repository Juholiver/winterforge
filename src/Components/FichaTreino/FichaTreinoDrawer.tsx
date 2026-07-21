import { useState } from 'react';
import ModalMeusTreinos from './ModalMeusTreinos';
import './FichaTreinoDrawer.css';
import type { CampoSerieReps, ExercicioFicha, TreinoSalvo } from '../../types/exercicio';

interface FichaTreinoDrawerProps {
  exerciciosFicha: ExercicioFicha[];
  onRemover: (id: ExercicioFicha['id']) => void;
  onLimpar: () => void;
  onAtualizarSerieReps: (id: ExercicioFicha['id'], campo: CampoSerieReps, valor: string) => void;
  onCarregarFichaCompleta?: (exercicios: ExercicioFicha[]) => void;
}

export default function FichaTreinoDrawer({
  exerciciosFicha,
  onRemover,
  onLimpar,
  onAtualizarSerieReps,
  onCarregarFichaCompleta,
}: FichaTreinoDrawerProps) {
  const [nomeTreino, setNomeTreino] = useState('Treino A - Hipertrofia');
  const [modalAberto, setModalAberto] = useState(false);

  const handleSalvarNoHistorico = () => {
    if (exerciciosFicha.length === 0) return;

    const historicoAtual = JSON.parse(localStorage.getItem('@wolf:historicoFichas') || '[]') as TreinoSalvo[];

    const novoTreino: TreinoSalvo = {
      id: Date.now(),
      nome: nomeTreino.trim() || 'Treino sem nome',
      data: new Date().toLocaleDateString('pt-BR'),
      exercicios: exerciciosFicha,
    };

    const novoHistorico = [novoTreino, ...historicoAtual];
    localStorage.setItem('@wolf:historicoFichas', JSON.stringify(novoHistorico));

    alert('Treino salvo no seu histórico!');
  };

  const handleCarregarTreinoSelecionado = (treinoSalvo: TreinoSalvo) => {
    setNomeTreino(treinoSalvo.nome);
    if (onCarregarFichaCompleta) {
      onCarregarFichaCompleta(treinoSalvo.exercicios);
    }
  };

  return (
    <section className="wolf-drawer-container">
      <div className="wolf-drawer-header">
        <input
          type="text"
          value={nomeTreino}
          onChange={(e) => setNomeTreino(e.target.value)}
          className="wolf-drawer-title-input"
        />

        <button className="wolf-btn-history" onClick={() => setModalAberto(true)}>
          📂 Ver Treinos Salvos
        </button>
      </div>

      <div className="wolf-drawer-body">
        {exerciciosFicha.length === 0 ? (
          <div className="wolf-drawer-empty">
            <p>Sua ficha ainda está vazia.</p>
            <small>Adicione exercícios na biblioteca para montar seu treino.</small>
          </div>
        ) : (
          exerciciosFicha.map((item) => (
            <article key={String(item.id)} className="wolf-drawer-item">
              <div className="wolf-drawer-item-info">
                <h4>{item.nome ?? 'Exercício'}</h4>
                <div className="wolf-drawer-inputs">
                  <label>
                    Séries
                    <input
                      type="number"
                      min="1"
                      value={item.seriesCustom}
                      onChange={(e) => onAtualizarSerieReps(item.id, 'seriesCustom', e.target.value)}
                    />
                  </label>
                  <label>
                    Reps
                    <input
                      type="number"
                      min="1"
                      value={item.repsCustom}
                      onChange={(e) => onAtualizarSerieReps(item.id, 'repsCustom', e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <button
                className="wolf-btn-remove-item"
                onClick={() => onRemover(item.id)}
                aria-label={`Remover ${item.nome ?? 'exercício'}`}
              >
                ✕
              </button>
            </article>
          ))
        )}
      </div>

      <div className="wolf-drawer-footer">
        <button className="wolf-btn-save" onClick={handleSalvarNoHistorico} disabled={exerciciosFicha.length === 0}>
          Salvar Ficha
        </button>
        <button className="wolf-btn-clear" onClick={onLimpar} disabled={exerciciosFicha.length === 0}>
          Limpar
        </button>
      </div>

      <ModalMeusTreinos
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onCarregarTreino={handleCarregarTreinoSelecionado}
      />
    </section>
  );
}