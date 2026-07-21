
import './ExerciseCard.css';

export default function ExerciseCard({ exercicio }) {
  // Exemplo de fallback para dados se a prop vier vazia
  const {
    nome,
    grupoMuscular,
    equipamento,
    nivel,
    seriesRecomendadas,
    repeticoes,
    gif
  } = exercicio || {};

  return (
    <div className="wolf-exercise-card">
      <div className="wolf-card-content">
        {/* Banner / GIF do Exercício */}
        <div className="wolf-media-container">
          {gif ? (
            <img src={gif} alt={nome} className="wolf-exercise-gif" />
          ) : (
            <div className="wolf-media-placeholder">Sem imagem</div>
          )}
          <span className="wolf-badge-group">{grupoMuscular}</span>
        </div>

        {/* Informações do Exercício */}
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