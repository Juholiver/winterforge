import React, { useState, useEffect } from 'react';
import './FichaTreinoDrawer.css';

export default function FichaTreinoDrawer({ 
  exerciciosFicha, 
  onRemover, 
  onLimpar,
  onAtualizarSerieReps 
}) {
  const [nomeTreino, setNomeTreino] = useState('Treino A - Hipertrofia');
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  // Carrega nome do treino salvo
  useEffect(() => {
    const salvo = localStorage.getItem('@wolf:nomeTreino');
    if (salvo) setNomeTreino(salvo);
  }, []);

  const handleSalvar = () => {
    localStorage.setItem('@wolf:fichaTreino', JSON.stringify(exerciciosFicha));
    localStorage.setItem('@wolf:nomeTreino', nomeTreino);
    
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 2500);
  };

  return (
    <aside className="wolf-drawer-container">
      <div className="wolf-drawer-header">
        <input 
          type="text" 
          value={nomeTreino} 
          onChange={(e) => setNomeTreino(e.target.value)}
          className="wolf-drawer-title-input"
          placeholder="Nome do Treino..."
        />
        <span className="wolf-drawer-badge">{exerciciosFicha.length} ex.</span>
      </div>

      <div className="wolf-drawer-body">
        {exerciciosFicha.length === 0 ? (
          <div className="wolf-drawer-empty">
            <p>Sua ficha está vazia.</p>
            <small>Clique em <strong>+ Ficha</strong> nos cards para montar seu treino.</small>
          </div>
        ) : (
          exerciciosFicha.map((item) => (
            <div key={item.id} className="wolf-drawer-item">
              <div className="wolf-drawer-item-info">
                <h4>{item.nome}</h4>
                <div className="wolf-drawer-inputs">
                  <label>
                    Séries:
                    <input 
                      type="text" 
                      value={item.seriesCustom || item.seriesRecomendadas || '3'} 
                      onChange={(e) => onAtualizarSerieReps(item.id, 'seriesCustom', e.target.value)}
                    />
                  </label>
                  <label>
                    Reps:
                    <input 
                      type="text" 
                      value={item.repsCustom || item.repeticoes || '10'} 
                      onChange={(e) => onAtualizarSerieReps(item.id, 'repsCustom', e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <button 
                className="wolf-btn-remove-item" 
                onClick={() => onRemover(item.id)}
                title="Remover exercício"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {salvoFeedback && (
        <div className="wolf-drawer-alert">
          ⚡ Ficha salva no seu navegador!
        </div>
      )}

      <div className="wolf-drawer-footer">
        <button 
          className="wolf-btn-save" 
          onClick={handleSalvar}
          disabled={exerciciosFicha.length === 0}
        >
          Salvar no LocalStorage
        </button>
        <button 
          className="wolf-btn-clear" 
          onClick={onLimpar}
          disabled={exerciciosFicha.length === 0}
        >
          Limpar
        </button>
      </div>
    </aside>
  );
}