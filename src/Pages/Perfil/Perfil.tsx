import type { JSX } from 'react/jsx-runtime';
import { useAuth } from '../../Context/AuthContext';
import type { UserProfile } from '../../Services/authService';
import './Perfil.css';

const parseUserFromToken = (token: string): UserProfile | null => {
  try {
    const tokenValue = token.trim();

    // Caso o token esteja armazenado em formato JSON antigo
    if (tokenValue.startsWith('{') && tokenValue.endsWith('}')) {
      const parsed = JSON.parse(tokenValue) as { nome?: string; name?: string; email?: string };
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
      id: decoded.id || decoded.sub || decoded._id,
      nome:
        decoded.nome ||
        decoded.name ||
        decoded.username ||
        (decoded.email ? decoded.email.split('@')[0] : 'Atleta'),
      email: decoded.email || decoded.user_email || 'Não informado',
    };
  } catch {
    return null;
  }
};

const getInitialProfileState = (): {
  userData: UserProfile | null;
  error: string | null;
} => {
  try {
    const savedUserRaw = localStorage.getItem('@wolf:user');
    const token = localStorage.getItem('token') || localStorage.getItem('@wolf:token');

    let savedUser: UserProfile | null = null;
    if (savedUserRaw) {
      try {
        savedUser = JSON.parse(savedUserRaw) as UserProfile;
      } catch {
        savedUser = null;
      }
    }

    const parsedUser = token ? parseUserFromToken(token) : null;

    if (savedUser && (!savedUser.nome && !savedUser.name) && parsedUser) {
      return {
        userData: {
          ...parsedUser,
          ...savedUser,
        },
        error: null,
      };
    }

    if (savedUser) {
      return {
        userData: savedUser,
        error: null,
      };
    }

    if (!parsedUser) {
      return {
        userData: null,
        error: token
          ? 'Token inválido.'
          : 'Nenhum dado de perfil encontrado. Faça login novamente.',
      };
    }

    return {
      userData: parsedUser,
      error: null,
    };
  } catch (err) {
    console.error('Erro ao processar dados de perfil:', err);
    return {
      userData: null,
      error: 'Erro ao carregar as informações do perfil.',
    };
  }
};

export default function Perfil(): JSX.Element {
  const { logout } = useAuth();
  const { userData, error } = getInitialProfileState();
  const loading = false;

  const handleLogout = () => {
    localStorage.removeItem('@wolf:user');
    logout();
  };

  const userName = userData?.nome || userData?.name;

  return (
    <div className="wolf-profile-page">
      <div className="wolf-profile-card">
        {/* Cabeçalho */}
        <div className="wolf-profile-header">
          <div className="wolf-avatar-circle">
            {userName ? userName.charAt(0).toUpperCase() : 'W'}
          </div>
          <h1 className="wolf-profile-title">
            PERFIL DO <span>ATLETA</span>
          </h1>
          <p className="wolf-profile-subtitle">Painel de controle de conta</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="wolf-profile-state">
            <div className="wolf-spinner"></div>
            <p>Carregando dados do usuário...</p>
          </div>
        )}

        {/* Erro */}
        {error && !loading && (
          <div className="wolf-profile-state wolf-error-msg">
            <p>{error}</p>
          </div>
        )}

        {/* Dados do Usuário */}
        {!loading && !error && userData && (
          <div className="wolf-profile-body">
            <div className="wolf-field-group">
              <label className="wolf-field-label">NOME</label>
              <div className="wolf-field-value">
                {userData.name || userData.nome || 'Não informado'}
              </div>
            </div>

            <div className="wolf-field-group">
              <label className="wolf-field-label">E-MAIL</label>
              <div className="wolf-field-value">{userData.email || 'Não informado'}</div>
            </div>

            {(userData.id || userData._id) && (
              <div className="wolf-field-group">
                <label className="wolf-field-label">ID DA CONTA</label>
                <div className="wolf-field-value wolf-id-tag">
                  #{userData.id || userData._id}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botão de Logout */}
        <div className="wolf-profile-footer">
          <button onClick={handleLogout} className="wolf-btn-logout" type="button">
            <svg viewBox="0 0 24 24" className="wolf-icon-logout">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
}