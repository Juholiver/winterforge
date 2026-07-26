import './ModalMeusTreinos.css';
import type { TreinoSalvo } from '../../types/exercicio';

interface ModalMeusTreinosProps {
  isOpen: boolean;
  onClose: () => void;
  onCarregarTreino: (treino: TreinoSalvo) => void;
  treinos?: TreinoSalvo[];
  loading?: boolean;
  onDeleteTreino?: (id: number) => Promise<void> | void;
}

export default function ModalMeusTreinos({
  isOpen,
  onClose,
  onCarregarTreino,
  treinos = [],
  loading = false,
  onDeleteTreino,
}: ModalMeusTreinosProps) {
  if (!isOpen) return null;

  return (
    <div className="wolf-modal-overlay" onClick={onClose}>
      <div className="wolf-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="wolf-modal-header">
          <h3>📋 Meus Treinos Salvos</h3>
          <button className="wolf-btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="wolf-modal-body">
          {loading ? (
            <p className="wolf-empty-msg">Carregando treinos salvos...</p>
          ) : treinos.length === 0 ? (
            <p className="wolf-empty-msg">Nenhum treino salvo até o momento.</p>
          ) : (
            treinos.map((treino) => (
              <div key={treino.id} className="wolf-treino-card">
                <div className="wolf-treino-info">
                  <h4>{treino.nome}</h4>
                  <small>{treino.exercicios.length} exercícios • Salvo em {treino.data}</small>
                </div>
                <div className="wolf-treino-actions">
                  <button
                    className="wolf-btn-load"
                    onClick={() => {
                      onCarregarTreino(treino);
                      onClose();
                    }}
                  >
                    Carregar
                  </button>
                  <button className="wolf-btn-delete" onClick={() => onDeleteTreino?.(treino.id)}>
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}