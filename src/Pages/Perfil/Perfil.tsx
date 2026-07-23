import type { JSX } from 'react/jsx-runtime';
import { useState } from 'react';

import { useAuth } from '../../Context/AuthContext';
import {
  updateProfile,
  deleteProfile,
  type UserProfile,
} from '../../Services/authService';

import './Perfil.css';
import Logo from '../../../public/Logo.png';


// ==========================================
// DECODIFICAR USUÁRIO DO JWT
// ==========================================

const parseUserFromToken = (
  token: string
): UserProfile | null => {

  try {

    const tokenValue = token.trim();

    // Caso o token esteja armazenado em JSON
    if (
      tokenValue.startsWith('{') &&
      tokenValue.endsWith('}')
    ) {

      const parsed = JSON.parse(
        tokenValue
      ) as {
        nome?: string;
        name?: string;
        email?: string;
      };

      return {
        nome: parsed.nome || parsed.name,
        name: parsed.name || parsed.nome,
        email:
          parsed.email ||
          'Não informado',
      };
    }

    const base64Url =
      tokenValue.split('.')[1];

    if (!base64Url) {
      return null;
    }

    const base64 = base64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const jsonPayload =
      decodeURIComponent(
        atob(base64)
          .split('')
          .map(
            (c) =>
              '%' +
              (
                '00' +
                c
                  .charCodeAt(0)
                  .toString(16)
              ).slice(-2)
          )
          .join('')
      );

    const decoded =
      JSON.parse(jsonPayload);


    // Claims do .NET
    const id =
      decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ];

    const nome =
      decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
      ];

    const email =
      decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
      ];


    return {

      id:
        id ||
        decoded.id ||
        decoded.sub ||
        decoded._id,

      nome:
        nome ||
        decoded.nome ||
        decoded.name ||
        decoded.username ||
        'Atleta',

      name:
        nome ||
        decoded.name ||
        decoded.nome ||
        decoded.username ||
        'Atleta',

      email:
        email ||
        decoded.email ||
        decoded.user_email ||
        'Não informado',
    };


  } catch (error) {

    console.error(
      'Erro ao decodificar token:',
      error
    );

    return null;
  }
};


// ==========================================
// BUSCAR USUÁRIO INICIAL
// ==========================================

const getInitialProfileState = (): {
  userData: UserProfile | null;
  error: string | null;
} => {

  try {

    const savedUserRaw =
      localStorage.getItem(
        '@wolf:user'
      );

    const token =
      localStorage.getItem('token') ||
      localStorage.getItem(
        '@wolf:token'
      );


    let savedUser:
      | UserProfile
      | null = null;


    if (savedUserRaw) {

      try {

        savedUser =
          JSON.parse(
            savedUserRaw
          ) as UserProfile;

      } catch {

        savedUser = null;

      }
    }


    const parsedUser =
      token
        ? parseUserFromToken(token)
        : null;


    if (savedUser) {

      return {

        userData: {
          ...parsedUser,
          ...savedUser,
        },

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


  } catch (error) {

    console.error(
      'Erro ao processar dados:',
      error
    );

    return {

      userData: null,

      error:
        'Erro ao carregar as informações do perfil.',

    };
  }
};


// ==========================================
// COMPONENTE PERFIL
// ==========================================

export default function Perfil(): JSX.Element {

  const { logout } = useAuth();


  // ========================================
  // ESTADO INICIAL
  // ========================================

  const initialProfile =
    getInitialProfileState();


  // ========================================
  // ESTADOS
  // ========================================

  const [
    userData,
    setUserData,
  ] = useState<UserProfile | null>(
    initialProfile.userData
  );


  const [
    error,
    setError,
  ] = useState<string | null>(
    initialProfile.error
  );


  const [
    message,
    setMessage,
  ] = useState('');


  const [
    editing,
    setEditing,
  ] = useState(false);


  const [
    nome,
    setNome,
  ] = useState(
    initialProfile.userData?.nome ||
    initialProfile.userData?.name ||
    ''
  );


  const [
    email,
    setEmail,
  ] = useState(
    initialProfile.userData?.email ||
    ''
  );


  const [
    loading,
    setLoading,
  ] = useState(false);


  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {

    localStorage.removeItem(
      '@wolf:user'
    );

    logout();

  };


  // ========================================
  // EDITAR PERFIL
  // ========================================

  const handleEdit = () => {

    setMessage('');
    setError(null);

    setNome(
      userData?.nome ||
      userData?.name ||
      ''
    );

    setEmail(
      userData?.email ||
      ''
    );

    setEditing(true);

  };


  // ========================================
  // CANCELAR EDIÇÃO
  // ========================================

  const handleCancelEdit = () => {

    setNome(
      userData?.nome ||
      userData?.name ||
      ''
    );

    setEmail(
      userData?.email ||
      ''
    );

    setEditing(false);

    setMessage('');

    setError(null);

  };


  // ========================================
  // SALVAR PERFIL
  // ========================================

  const handleSave = async () => {

    if (!nome.trim()) {

      setError(
        'Informe seu nome.'
      );

      return;
    }


    if (!email.trim()) {

      setError(
        'Informe seu e-mail.'
      );

      return;
    }


    try {

      setLoading(true);

      setError(null);

      setMessage('');


      // PUT /api/profile
      const response =
        await updateProfile(
          nome,
          email
        );


      console.log(
        'Perfil atualizado:',
        response
      );


      // Atualiza o usuário na tela
      const updatedUser: UserProfile = {

        ...userData,

        nome: nome,

        name: nome,

        email: email,

      };


      setUserData(
        updatedUser
      );


      // Atualiza localStorage
      localStorage.setItem(

        '@wolf:user',

        JSON.stringify(
          updatedUser
        )

      );


      setEditing(false);


      setMessage(
        'Perfil atualizado com sucesso!'
      );


    } catch (error: any) {

      console.error(
        'Erro ao atualizar perfil:',
        error
      );


      setError(

        error.response?.data?.message ||

        'Não foi possível atualizar o perfil.'

      );


    } finally {

      setLoading(false);

    }
  };


  // ========================================
  // EXCLUIR CONTA
  // ========================================

  const handleDeleteAccount =
    async () => {

      const confirmed =
        window.confirm(

          'Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.'

        );


      if (!confirmed) {
        return;
      }


      try {

        setLoading(true);

        setError(null);


        // DELETE /api/profile
        await deleteProfile();


        // Limpa usuário salvo
        localStorage.removeItem(
          '@wolf:user'
        );


        // Logout
        logout();


      } catch (error: any) {

        console.error(
          'Erro ao excluir conta:',
          error
        );


        setError(

          error.response?.data?.message ||

          'Não foi possível excluir sua conta.'

        );


      } finally {

        setLoading(false);

      }
    };


  // ========================================
  // NOME DO USUÁRIO
  // ========================================

  const userName =
    userData?.nome ||
    userData?.name ||
    'Atleta';


  // ========================================
  // JSX
  // ========================================

  return (

    <div className="wolf-profile-page">

      <div className="wolf-profile-card">


        {/* LOGO */}

        <div className="wolf-logo-container">

          <img
            src={Logo}
            alt="Logo do Projeto"
            className="wolf-logo-img"
          />

        </div>


        {/* CABEÇALHO */}

        <div className="wolf-profile-header">

          <div className="wolf-avatar-circle">

            {userName
              .charAt(0)
              .toUpperCase()}

          </div>


          <h1 className="wolf-profile-title">

            PERFIL DO <span>ATLETA</span>

          </h1>


          <p className="wolf-profile-subtitle">

            Painel de controle de conta

          </p>

        </div>


        {/* MENSAGEM DE SUCESSO */}

        {message && (

          <div className="wolf-success-msg">

            {message}

          </div>

        )}


        {/* ERRO */}

        {error && (

          <div className="wolf-error-msg">

            {error}

          </div>

        )}


        {/* DADOS */}

        {userData && (

          <div className="wolf-profile-body">


            {/* NOME */}

            <div className="wolf-field-group">

              <label className="wolf-field-label">

                NOME

              </label>


              {editing ? (

                <input
                  type="text"
                  className="wolf-profile-input"
                  value={nome}
                  onChange={(event) =>
                    setNome(
                      event.target.value
                    )
                  }
                />

              ) : (

                <div className="wolf-field-value">

                  {userData.name ||
                    userData.nome ||
                    'Não informado'}

                </div>

              )}

            </div>


            {/* EMAIL */}

            <div className="wolf-field-group">

              <label className="wolf-field-label">

                E-MAIL

              </label>


              {editing ? (

                <input
                  type="email"
                  className="wolf-profile-input"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                />

              ) : (

                <div className="wolf-field-value">

                  {userData.email ||
                    'Não informado'}

                </div>

              )}

            </div>


            {/* ID */}

            {(userData.id ||
              userData._id) && (

              <div className="wolf-field-group">

                <label className="wolf-field-label">

                  ID DA CONTA

                </label>


                <div className="wolf-field-value wolf-id-tag">

                  #
                  {userData.id ||
                    userData._id}

                </div>

              </div>

            )}

          </div>

        )}


        {/* BOTÕES */}

        <div className="wolf-profile-footer">


          {!editing ? (

            <button
              type="button"
              className="wolf-btn-edit"
              onClick={handleEdit}
            >

              ✏️ Editar Perfil

            </button>

          ) : (

            <div className="wolf-edit-actions">

              <button
                type="button"
                className="wolf-btn-save"
                onClick={handleSave}
                disabled={loading}
              >

                {loading
                  ? 'Salvando...'
                  : 'Salvar Alterações'}

              </button>


              <button
                type="button"
                className="wolf-btn-cancel"
                onClick={
                  handleCancelEdit
                }
                disabled={loading}
              >

                Cancelar

              </button>

            </div>

          )}


          {/* EXCLUIR */}

          <button
            type="button"
            className="wolf-btn-delete"
            onClick={
              handleDeleteAccount
            }
            disabled={loading}
          >

            🗑️ Excluir Conta

          </button>


          {/* LOGOUT */}

          <button
            onClick={
              handleLogout
            }
            className="wolf-btn-logout"
            type="button"
          >

            <svg
              viewBox="0 0 24 24"
              className="wolf-icon-logout"
            >

              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />

            </svg>

            Sair da Conta

          </button>


        </div>

      </div>

    </div>

  );

}