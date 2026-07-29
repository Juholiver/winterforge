import type { JSX } from 'react/jsx-runtime';
import { useState, type MouseEvent } from 'react';
import { useNavigate } from "react-router-dom";

import { useAuth } from '../../Context/AuthContext';
import { updateProfile, deleteProfile, type UserProfile } from '../../Services/authService';
import { useTreinos } from '../../Hooks/useTreinos';
import { getGifPorId, getGifPorNome } from '../../Services/exercicioService';

import RestTimer from '../../components/RestTimer/RestTimer';
import ExercicioModal, { type ExercicioItem } from '../../components/ExercicioModal/ExercicioModal';

import './Perfil.css';
import Logo from '../../../public/Logo.png';

// Decodificação do Token JWT
const parseUserFromToken = (token: string): UserProfile | null => {
  try {
    const tokenValue = token.trim();
    if (tokenValue.startsWith('{') && tokenValue.endsWith('}')) {
      const parsed = JSON.parse(tokenValue);
      return {
        nome: parsed.nome || parsed.name,
        name: parsed.name || parsed.nome,
        email: parsed.email || 'Não informado',
      };
    }
    const base64Url = tokenValue.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);

    return {
      id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.id || decoded.sub,
      nome: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.nome || decoded.name || 'Atleta',
      name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.name || decoded.nome || 'Atleta',
      email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || decoded.email || 'Não informado',
    };
  } catch {
    return null;
  }
};

const getInitialProfileState = () => {
  try {
    const savedUserRaw = localStorage.getItem('@wolf:user');
    const token = localStorage.getItem('token') || localStorage.getItem('@wolf:token');
    let savedUser: UserProfile | null = null;

    if (savedUserRaw) {
      try { savedUser = JSON.parse(savedUserRaw); } catch { savedUser = null; }
    }
    const parsedUser = token ? parseUserFromToken(token) : null;

    if (savedUser) return { userData: { ...parsedUser, ...savedUser }, error: null };
    if (!parsedUser) return { userData: null, error: token ? 'Token inválido.' : 'Faça login novamente.' };
    return { userData: parsedUser, error: null };
  } catch {
    return { userData: null, error: 'Erro ao carregar informações.' };
  }
};

export default function Perfil(): JSX.Element {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { historicoTreinos, loadingTreinos, actions: treinoActions } = useTreinos();

  // Estados Perfil
  const initialProfile = getInitialProfileState();
  const [userData, setUserData] = useState<UserProfile | null>(initialProfile.userData);
  const [error, setError] = useState<string | null>(initialProfile.error);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(initialProfile.userData?.nome || initialProfile.userData?.name || '');
  const [email, setEmail] = useState(initialProfile.userData?.email || '');
  const [loading, setLoading] = useState(false);

  // Fichas & Modal GIF
  const [fichaSelecionadaId, setFichaSelecionadaId] = useState<number | null>(null);
  const [exercicioModal, setExercicioModal] = useState<ExercicioItem | null>(null);
  const [loadingGif, setLoadingGif] = useState<boolean>(false);

  // Estado para os Exercícios Concluídos (Checklist)
  const [exerciciosConcluidos, setExerciciosConcluidos] = useState<(string | number)[]>([]);

  // Lógica para marcar/desmarcar o exercício como concluído
  const handleToggleConcluido = (e: MouseEvent, idExercicio: string | number) => {
    e.stopPropagation();
    setExerciciosConcluidos((prev) =>
      prev.includes(idExercicio)
        ? prev.filter((id) => id !== idExercicio)
        : [...prev, idExercicio]
    );
  };

  // Abrir Modal e Carregar GIF Dinâmico da API
  const handleAbrirExercicioModal = async (exercicio: ExercicioItem) => {
    setExercicioModal(exercicio);

    if (exercicio.gif) return;

    setLoadingGif(true);
    let urlGif: string | null = null;

    if (exercicio.exercicioId || exercicio.id) {
      urlGif = await getGifPorId(exercicio.exercicioId || exercicio.id!);
    }

    if (!urlGif && exercicio.nome) {
      urlGif = await getGifPorNome(exercicio.nome);
    }

    if (urlGif) {
      setExercicioModal((prev) => (prev ? { ...prev, gif: urlGif } : null));
    }

    setLoadingGif(false);
  };

  // Ações de Usuário
  const handleLogout = () => {
    localStorage.removeItem('@wolf:user');
    logout();
  };

  const handleEdit = () => {
    setMessage('');
    setError(null);
    setNome(userData?.nome || userData?.name || '');
    setEmail(userData?.email || '');
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setNome(userData?.nome || userData?.name || '');
    setEmail(userData?.email || '');
    setEditing(false);
    setMessage('');
    setError(null);
  };

  const handleSave = async () => {
    if (!nome.trim() || !email.trim()) {
      setError('Informe nome e e-mail.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await updateProfile(nome, email);
      const updatedUser = { ...userData, nome, name: nome, email };
      setUserData(updatedUser);
      localStorage.setItem('@wolf:user', JSON.stringify(updatedUser));
      setEditing(false);
      setMessage('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Tem certeza que deseja excluir sua conta?')) return;
    try {
      setLoading(true);
      await deleteProfile();
      localStorage.removeItem('@wolf:user');
      logout();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir conta.');
    } finally {
      setLoading(false);
    }
  };

  const fichaSelecionada = historicoTreinos.find((t) => t.id === fichaSelecionadaId) ?? null;

  const handleExcluirFicha = async (e: MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir esta ficha?')) return;
    await treinoActions.deleteTreino(id);
    if (fichaSelecionadaId === id) setFichaSelecionadaId(null);
  };

  const getGruposDaFicha = (exercicios: any[]) => {
    const grupos = Array.from(new Set(exercicios.map((ex) => ex.grupoMuscular).filter(Boolean)));
    return grupos.length ? grupos.slice(0, 2).join(' e ') : 'Treino completo';
  };

  const userName = userData?.nome || userData?.name || 'Atleta';

  return (
    <div className="wolf-profile-page">
      <div className="wolf-layout-container">
        {/* CARD LATERAL - PERFIL */}
        <aside className="wolf-profile-card">
          <div className="wolf-logo-container">
            <img src={Logo} alt="Logo Projeto" className="wolf-logo-img" />
          </div>

          <div className="wolf-profile-header">
            <div className="wolf-avatar-circle">{userName.charAt(0).toUpperCase()}</div>
            <h1 className="wolf-profile-title">
              PERFIL DO <span>ATLETA</span>
            </h1>
            <p className="wolf-profile-subtitle">Painel de controle de conta</p>
          </div>

          {message && <div className="wolf-success-msg">{message}</div>}
          {error && <div className="wolf-error-msg">{error}</div>}

          {userData && (
            <div className="wolf-profile-body">
              <div className="wolf-field-group">
                <label className="wolf-field-label">NOME</label>
                {editing ? (
                  <input
                    type="text"
                    className="wolf-profile-input"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                ) : (
                  <div className="wolf-field-value">{userName}</div>
                )}
              </div>

              <div className="wolf-field-group">
                <label className="wolf-field-label">E-MAIL</label>
                {editing ? (
                  <input
                    type="email"
                    className="wolf-profile-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                ) : (
                  <div className="wolf-field-value">{userData.email || 'Não informado'}</div>
                )}
              </div>

              {(userData.id || userData._id) && (
                <div className="wolf-field-group">
                  <label className="wolf-field-label">ID DA CONTA</label>
                  <div className="wolf-field-value wolf-id-tag">#{userData.id || userData._id}</div>
                </div>
              )}
            </div>
          )}

          <div className="wolf-profile-footer">
            {!editing ? (
              <button type="button" className="wolf-btn-edit" onClick={handleEdit}>
                ✏️ Editar Perfil
              </button>
            ) : (
              <div className="wolf-edit-actions">
                <button type="button" className="wolf-btn-save" onClick={handleSave} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button type="button" className="wolf-btn-cancel" onClick={handleCancelEdit} disabled={loading}>
                  Cancelar
                </button>
              </div>
            )}
            <button
              type="button"
              className="wolf-btn-edit"
              onClick={() => navigate("/perfil/treinos")}
            >
              🏋️‍♂️ Fichas de Treinos
            </button>

            <button type="button" className="wolf-btn-delete" onClick={handleDeleteAccount} disabled={loading}>
              🗑️ Excluir Conta
            </button>

            <button onClick={handleLogout} className="wolf-btn-logout" type="button">
              <svg viewBox="0 0 24 24" className="wolf-icon-logout">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              Sair da Conta
            </button>
          </div>
        </aside>

        {/* ÁREA EXPANDIDA DA FICHA */}
        <main className="wolf-fichas-container">
          <div className="wolf-fichas-header">
            {fichaSelecionada ? (
              <>
                <button
                  type="button"
                  className="wolf-btn-voltar-ficha"
                  onClick={() => setFichaSelecionadaId(null)}
                >
                  ← Voltar
                </button>
                <h2 className="wolf-fichas-title">{fichaSelecionada.nome}</h2>
              </>
            ) : (
              <h2 className="wolf-fichas-title">Minhas Fichas de Treino</h2>
            )}
          </div>

          {loadingTreinos && (
            <div className="wolf-profile-state">
              <div className="wolf-spinner" />
              <span>Carregando fichas...</span>
            </div>
          )}

          {!loadingTreinos && !fichaSelecionada && historicoTreinos.length === 0 && (
            <p className="wolf-fichas-empty">Você ainda não salvou nenhuma ficha de treino.</p>
          )}

          {/* GRID DE CARDS DAS FICHAS */}
          {!loadingTreinos && !fichaSelecionada && historicoTreinos.length > 0 && (
            <div className="wolf-fichas-grid">
              {historicoTreinos.map((treino) => (
                <div
                  key={treino.id}
                  className="wolf-ficha-card"
                  onClick={() => setFichaSelecionadaId(treino.id)}
                >
                  <button
                    type="button"
                    className="wolf-ficha-delete"
                    onClick={(e) => handleExcluirFicha(e, treino.id)}
                  >
                    ×
                  </button>
                  <span className="wolf-ficha-letra">
                    {treino.nome.replace(/[^A-Za-zÀ-ÿ]/g, '').slice(-1).toUpperCase() || 'A'}
                  </span>
                  <span className="wolf-ficha-nome">{treino.nome}</span>
                  <span className="wolf-ficha-grupos">{getGruposDaFicha(treino.exercicios)}</span>
                  <span className="wolf-ficha-count">
                    {treino.exercicios.length} {treino.exercicios.length === 1 ? 'exercício' : 'exercícios'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* LISTA DOS EXERCÍCIOS DA FICHA SELECIONADA */}
          {!loadingTreinos && fichaSelecionada && (
            <div className="wolf-exercicios-list">
              {fichaSelecionada.exercicios.map((exercicio, index) => {
                const exercicioId = exercicio.exercicioId ?? exercicio.id ?? index;
                const isConcluido = exerciciosConcluidos.includes(exercicioId);

                return (
                  <div
                    key={String(exercicioId)}
                    className={`wolf-exercicio-row ${isConcluido ? 'wolf-exercicio-concluido' : ''}`}
                    onClick={() => handleAbrirExercicioModal(exercicio as ExercicioItem)}
                  >
                    <button
                      type="button"
                      className={`wolf-checkbox-btn ${isConcluido ? 'checked' : ''}`}
                      onClick={(e) => handleToggleConcluido(e, exercicioId)}
                      title={isConcluido ? "Marcar como não feito" : "Marcar como concluído"}
                    >
                      {isConcluido ? '✓' : index + 1}
                    </button>

                    <div className="wolf-exercicio-gif-wrap">
                      {exercicio.gif ? (
                        <img src={exercicio.gif} alt={exercicio.nome} className="wolf-exercicio-gif" />
                      ) : (
                        <div className="wolf-exercicio-gif-placeholder">🐺</div>
                      )}
                    </div>

                    <div className="wolf-exercicio-info">
                      <span className="wolf-exercicio-nome">{exercicio.nome}</span>
                      <span className="wolf-exercicio-grupo">
                        {exercicio.grupoMuscular || 'Grupo não informado'}
                      </span>
                    </div>

                    <div className="wolf-exercicio-meta">
                      <div className="wolf-exercicio-meta-item">
                        <span className="wolf-meta-label">Séries</span>
                        <span className="wolf-meta-value">
                          {exercicio.seriesCustom || exercicio.seriesRecomendadas}
                        </span>
                      </div>
                      <div className="wolf-exercicio-meta-item">
                        <span className="wolf-meta-label">Reps</span>
                        <span className="wolf-meta-value">
                          {exercicio.repsCustom || exercicio.repeticoes}
                        </span>
                      </div>
                    </div>

                    <span className="wolf-click-hint">Ver GIF ➔</span>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* COMPONENTES EXTRAÍDOS */}
      <RestTimer />

      {exercicioModal && (
        <ExercicioModal
          exercicio={exercicioModal}
          loadingGif={loadingGif}
          onClose={() => setExercicioModal(null)}
        />
      )}
    </div>
  );
}