import React, { useState, useEffect } from 'react';
import './FichaTreino.css';
import type { ExercicioFicha } from '../../types/exercicio';

interface FichaTreinoProps {
  exerciciosSelecionados: ExercicioFicha[];
  onRemoverExercicio: (id: number | string) => void;
  onLimparFicha: () => void;
}

export const FichaTreino: React.FC<FichaTreinoProps> = ({
  exerciciosSelecionados,
  onRemoverExercicio,
  onLimparFicha,
}) => {
  const [nomeTreino, setNomeTreino] = useState('Meu Treino A');
  const [mensagemSucesso, setMensagemSucesso] = useState(false);

  // Carrega o nome do treino do localStorage ao iniciar, se existir
  useEffect(() => {
    const salvo = localStorage.getItem('@winterforge:nomeTreino');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (salvo) setNomeTreino(salvo);
  }, []);

  const salvarNoLocalStorage = () => {
    if (exerciciosSelecionados.length === 0) return;

    localStorage.setItem('@winterforge:nomeTreino', nomeTreino);
    localStorage.setItem(
      '@winterforge:fichaTreino',
      JSON.stringify(exerciciosSelecionados)
    );

    setMensagemSucesso(true);
    setTimeout(() => setMensagemSucesso(false), 3000);
  };

  return (
    <aside className="wolf-ficha-container">
      <div className="wolf-ficha-header">
        <input
          type="text"
          className="wolf-ficha-title-input"
          value={nomeTreino}
          onChange={(e) => setNomeTreino(e.target.value)}
          placeholder="Nome do Treino (ex: Treino A)"
        />
        <span className="wolf-ficha-count">
          {exerciciosSelecionados.length} ex.
        </span>
      </div>

      <div className="wolf-ficha-list">
        {exerciciosSelecionados.length === 0 ? (
          <p className="wolf-ficha-empty">
            Nenhum exercício adicionado. Clique no botão de adicionar nos cards para montar sua ficha!
          </p>
        ) : (
          exerciciosSelecionados.map((item) => (
            <div key={item.id} className="wolf-ficha-item">
              <div className="wolf-ficha-item-info">
                <strong>{item.nome}</strong>
                <span>
                  {item.grupoMuscular} • {item.seriesCustom} x {item.repsCustom}
                </span>
              </div>
              <button
                className="wolf-btn-remove"
                onClick={() => onRemoverExercicio(item.id)}
                title="Remover"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {mensagemSucesso && (
        <div className="wolf-ficha-feedback">Ficha salva no navegador! ⚡</div>
      )}

      <div className="wolf-ficha-actions">
        <button
          className="wolf-btn wolf-btn-primary"
          onClick={salvarNoLocalStorage}
          disabled={exerciciosSelecionados.length === 0}
        >
          Salvar Ficha
        </button>
        <button
          className="wolf-btn wolf-btn-secondary"
          onClick={onLimparFicha}
          disabled={exerciciosSelecionados.length === 0}
        >
          Limpar
        </button>
      </div>
    </aside>
  );
};