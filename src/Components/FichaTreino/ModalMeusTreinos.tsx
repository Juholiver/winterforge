import { useState } from 'react';
import './ModalMeusTreinos.css';
import type { TreinoSalvo } from '../../types/exercicio';

interface ModalMeusTreinosProps {
  isOpen: boolean;
  onClose: () => void;
  onCarregarTreino: (treino: TreinoSalvo) => void;
}

const readHistorico = (): TreinoSalvo[] => {
  const historicoBruto = localStorage.getItem('@wolf:historicoFichas');
  if (!historicoBruto) return [];

  try {
    return JSON.parse(historicoBruto) as TreinoSalvo[];
  } catch {
    return [];
  }
};

export default function ModalMeusTreinos({ isOpen, onClose, onCarregarTreino }: ModalMeusTreinosProps) {
  const [historico, setHistorico] = useState<TreinoSalvo[]>(() => readHistorico());

  const historicoExibir = isOpen ? readHistorico() : historico;

  if (!isOpen) return null;

  const handleExcluir = (idParaRemover: number) => {
    const novoHistorico = historicoExibir.filter((item) => item.id !== idParaRemover);
    localStorage.setItem('@wolf:historicoFichas', JSON.stringify(novoHistorico));
    setHistorico(novoHistorico);
  };

  return (
    <div className="wolf-modal-overlay" onClick={onClose}>
      <div className="wolf-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="wolf-modal-header">
          <h3>📋 Meus Treinos Salvos</h3>
          <button className="wolf-btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="wolf-modal-body">
          {historicoExibir.length === 0 ? (
            <p className="wolf-empty-msg">Nenhum treino salvo até o momento.</p>
          ) : (
            historicoExibir.map((treino) => (
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
                  <button className="wolf-btn-delete" onClick={() => handleExcluir(treino.id)}>
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