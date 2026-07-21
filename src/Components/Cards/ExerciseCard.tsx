import './ExerciseCard.css';
import type { Exercicio } from '../../types/exercicio';

interface ExerciseCardProps {
  exercicio?: Exercicio;
}

export default function ExerciseCard({ exercicio }: ExerciseCardProps) {
  const nome = exercicio?.nome ?? 'Exercício';
  const grupoMuscular = exercicio?.grupoMuscular ?? 'Grupo';
  const equipamento = exercicio?.equipamento ?? 'Equipamento';
  const nivel = exercicio?.nivel ?? 'Nível';
  const seriesRecomendadas = exercicio?.seriesRecomendadas ?? '3';
  const repeticoes = exercicio?.repeticoes ?? '10';
  const gif = exercicio?.gif;

  return (
    <div className="wolf-exercise-card">
      <div className="wolf-card-content">
        <div className="wolf-media-container">
          {gif ? (
            <img src={gif} alt={nome} className="wolf-exercise-gif" />
          ) : (
            <div className="wolf-media-placeholder">Sem imagem</div>
          )}
          <span className="wolf-badge-group">{grupoMuscular}</span>
        </div>

        <div className="wolf-exercise-info">
          <h3 className="wolf-exercise-title">{nome}</h3>

          <div className="wolf-details-grid">
            <div className="wolf-detail-item">
              <span className="wolf-detail-label">Séries</span>
              <span className="wolf-detail-value">{seriesRecomendadas}</span>
            </div>
            <div className="wolf-detail-item">
              <span className="wolf-detail-label">Reps</span>
              <span className="wolf-detail-value">{repeticoes}</span>
            </div>
          </div>

          <div className="wolf-tags">
            <span className="wolf-tag">{equipamento}</span>
            <span className="wolf-tag">{nivel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}