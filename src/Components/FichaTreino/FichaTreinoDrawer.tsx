import { useEffect, useState } from 'react';
import ModalMeusTreinos from './ModalMeusTreinos';
import './FichaTreinoDrawer.css';
import type { CampoSerieReps, ExercicioFicha, TreinoSalvo } from '../../types/exercicio';

interface FichaTreinoDrawerProps {
  exerciciosFicha: ExercicioFicha[];
  onRemover: (id: ExercicioFicha['id']) => void;
  onLimpar: () => void;
  onAtualizarSerieReps: (id: ExercicioFicha['id'], campo: CampoSerieReps, valor: string) => void;
  onCarregarFichaCompleta?: (exercicios: ExercicioFicha[]) => void;
  mode?: 'local' | 'database';
  treinosSalvos?: TreinoSalvo[];
  loadingTreinos?: boolean;
  onSalvarFicha?: (nomeTreino: string, exercicios: ExercicioFicha[]) => Promise<void> | void;
  onDeleteTreino?: (id: number) => Promise<void> | void;
  onCarregarTreinos?: () => Promise<TreinoSalvo[]>;
}

const readHistoricoLocal = (): TreinoSalvo[] => {
  const historicoBruto = localStorage.getItem('@wolf:historicoFichas');
  if (!historicoBruto) return [];

  try {
    return JSON.parse(historicoBruto) as TreinoSalvo[];
  } catch {
    return [];
  }
};

export default function FichaTreinoDrawer({
  exerciciosFicha,
  onRemover,
  onLimpar,
  onAtualizarSerieReps,
  onCarregarFichaCompleta,
  mode = 'local',
  treinosSalvos = [],
  loadingTreinos = false,
  onSalvarFicha,
  onDeleteTreino,
  onCarregarTreinos,
}: FichaTreinoDrawerProps) {
  const [nomeTreino, setNomeTreino] = useState('Treino A - Hipertrofia');
  const [modalAberto, setModalAberto] = useState(false);
  const [historicoLocal, setHistoricoLocal] = useState<TreinoSalvo[]>(() => readHistoricoLocal());
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  // Define a origem do histórico com base na autenticação (mode)
  const historico = mode === 'database' ? treinosSalvos : historicoLocal;

  // Busca dados na API ao abrir a Modal (quando no modo database)
  useEffect(() => {
    if (!modalAberto || mode !== 'database' || !onCarregarTreinos) return;

    let isMounted = true;

    const carregarHistorico = async () => {
      try {
        setLoadingHistorico(true);
        await onCarregarTreinos();
      } catch (error) {
        console.error('Erro ao carregar treinos salvos:', error);
      } finally {
        if (isMounted) {
          setLoadingHistorico(false);
        }
      }
    };

    carregarHistorico();
    return () => {
      isMounted = false;
    };
  }, [modalAberto, mode, onCarregarTreinos]);

  const handleAbrirModal = () => {
    setModalAberto(true);
  };

  const handleSalvarNoHistorico = async () => {
    if (exerciciosFicha.length === 0) return;

    // FLUXO VIA BANCO DE DADOS (USUÁRIO LOGADO)
    if (mode === 'database') {
      try {
        await onSalvarFicha?.(nomeTreino.trim() || 'Treino sem nome', exerciciosFicha);
        alert('Ficha salva na sua conta!');
      } catch (error) {
        console.error('Erro ao salvar ficha:', error);
        alert('Não foi possível salvar a ficha.');
      }
      return;
    }
    

    // FLUXO VIA LOCALSTORAGE (USUÁRIO NÃO LOGADO)
    
    const historicoAtual = readHistoricoLocal();
    const novoTreino: TreinoSalvo = {
      id: Date.now(),
      nome: nomeTreino.trim() || 'Treino sem nome',
      data: new Date().toLocaleDateString('pt-BR'),
      exercicios: exerciciosFicha,
    };

    const novoHistorico = [novoTreino, ...historicoAtual];
    localStorage.setItem('@wolf:historicoFichas', JSON.stringify(novoHistorico));
    setHistoricoLocal(novoHistorico);

    alert('Treino salvo no seu histórico local!');
  };

  const handleExcluirTreino = async (idParaRemover: number) => {
    if (mode === 'database') {
      await onDeleteTreino?.(idParaRemover);
      return;
    }

    const novoHistorico = historicoLocal.filter((item) => item.id !== idParaRemover);
    localStorage.setItem('@wolf:historicoFichas', JSON.stringify(novoHistorico));
    setHistoricoLocal(novoHistorico);
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

        <button className="wolf-btn-history" onClick={handleAbrirModal}>
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
                      value={item.seriesCustom ?? '3'}
                      onChange={(e) => onAtualizarSerieReps(item.id, 'seriesCustom', e.target.value)}
                    />
                  </label>
                  <label>
                    Reps
                    <input
                      type="number"
                      min="1"
                      value={item.repsCustom ?? '10'}
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
        <button
          className="wolf-btn-save"
          onClick={handleSalvarNoHistorico}
          disabled={exerciciosFicha.length === 0}
        >
          Salvar Ficha
        </button>
        <button
          className="wolf-btn-clear"
          onClick={onLimpar}
          disabled={exerciciosFicha.length === 0}
        >
          Limpar
        </button>
      </div>

      <ModalMeusTreinos
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onCarregarTreino={handleCarregarTreinoSelecionado}
        treinos={historico}
        loading={loadingHistorico || loadingTreinos}
        onDeleteTreino={handleExcluirTreino}
      />
    </section>
  );
}