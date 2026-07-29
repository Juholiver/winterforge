import type { JSX } from 'react/jsx-runtime';
import './ExercicioModal.css';

export interface ExercicioItem {
  id?: string | number;
  exercicioId?: string | number;
  nome: string;
  grupoMuscular?: string;
  gif?: string;
  seriesCustom?: number;
  seriesRecomendadas?: number;
  repsCustom?: string | number;
  repeticoes?: string | number;
}

interface ExercicioModalProps {
  exercicio: ExercicioItem;
  loadingGif: boolean;
  onClose: () => void;
}

export default function ExercicioModal({ exercicio, loadingGif, onClose }: ExercicioModalProps): JSX.Element {
  return (
    <div className="wolf-modal-overlay" onClick={onClose}>
      <div className="wolf-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="wolf-modal-close"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="wolf-modal-title">{exercicio.nome}</h3>
        <span className="wolf-modal-subtitle">{exercicio.grupoMuscular || 'Musculação'}</span>

        <div className="wolf-modal-gif-container">
          {exercicio.gif ? (
            <img src={exercicio.gif} alt={exercicio.nome} className="wolf-modal-gif" />
          ) : loadingGif ? (
            <div className="wolf-profile-state">
              <div className="wolf-spinner" />
              <span>Buscando GIF...</span>
            </div>
          ) : (
            <div className="wolf-modal-no-gif">
              <span>🐺</span>
              <p>Demonstração em GIF indisponível para este exercício.</p>
            </div>
          )}
        </div>

        <div className="wolf-modal-details">
          <div>
            <span className="wolf-meta-label">SÉRIES</span>
            <strong>{exercicio.seriesCustom || exercicio.seriesRecomendadas || '-'}</strong>
          </div>
          <div>
            <span className="wolf-meta-label">REPETIÇÕES</span>
            <strong>{exercicio.repsCustom || exercicio.repeticoes || '-'}</strong>
          </div>
        </div>

        <button type="button" className="wolf-btn-save" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}