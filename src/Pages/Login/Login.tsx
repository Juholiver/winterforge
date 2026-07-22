import { useState, type FormEvent } from "react";
import "./Login.css";
import Logo from "../../../public/Logo.png";
import { useNavigate } from "react-router-dom";

import { login as loginApi, type UserProfile } from "../../Services/authService";
import { useAuth } from "../../Context/AuthContext";

const parseUserFromToken = (
  token: string
): UserProfile | null => {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      console.error("JWT inválido");
      return null;
    }

    const base64Url = parts[1];

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(
          (c) =>
            "%" +
            ("00" +
              c.charCodeAt(0).toString(16)
            ).slice(-2)
        )
        .join("")
    );

    const decoded = JSON.parse(jsonPayload);

    console.log(
      "CLAIMS DO JWT:",
      decoded
    );

    // Claims padrão gerados pelo .NET
    const id =
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ];

    const nome =
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ];

    const email =
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ];

    return {
      id,
      nome,
      name: nome,
      email,
    };

  } catch (error) {

    console.error(
      "Erro ao decodificar JWT:",
      error
    );

    return null;
  }
};


export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estados dos inputs
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Estados de controle
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);

    try {
      // Chama a API
      const response = await loginApi({
        email,
        senha,
      });

      console.log("Resposta da API:", response);
      

      // Trata diferentes estruturas para extrair o token e o usuário
      const token = response.token || response.data?.token || response.data?.data?.token || response.accessToken;
      console.log("TOKEN JWT:", token);
      const responseUser = response.user || response.data?.user || response.data?.data?.user || response.data?.usuario;
      const parsedUser = token ? parseUserFromToken(token) : null;
      console.log("USUÁRIO EXTRAÍDO DO TOKEN:", parsedUser);
      const user = responseUser || parsedUser;

      if (!token) {
        setErro("Não foi possível obter o token de acesso.");
        return;
      }

      // Salva os dados do usuário para serem usados no Perfil
      if (user) {
        localStorage.setItem("@wolf:user", JSON.stringify(user));
      }

      // Salva o token no AuthContext e no localStorage
      login(token);

      console.log("Usuário autenticado com sucesso!");

      // Redireciona para o perfil
      navigate("/perfil");
    } catch (error: unknown) {
      console.error("Erro no login:", error);

      type AxiosErrorLike = {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      const axiosError = error as AxiosErrorLike;

      if (axiosError?.response) {
        setErro(
          axiosError.response.data?.message || "E-mail ou senha inválidos."
        );
      } else {
        setErro("Não foi possível conectar com a API.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wolf-form-wrapper">
      <div className="wolf-card">
        <div className="wolf-card-inner">
          <form className="wolf-form" onSubmit={handleSubmit}>
            {/* LOGO */}
            <div className="wolf-logo-container">
              <img src={Logo} alt="Logo do Projeto" className="wolf-logo-img" />
            </div>

            <p id="wolf-heading">
              Forjado pela disciplina. Guiado pela honra
            </p>

            {/* MENSAGEM DE ERRO */}
            {erro && <div className="wolf-error">{erro}</div>}

            {/* EMAIL */}
            <div className="wolf-field">
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="wolf-input-icon"
              >
                <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
              </svg>

              <input
                type="email"
                name="email"
                className="wolf-input-field"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            {/* SENHA */}
            <div className="wolf-field">
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="wolf-input-icon"
              >
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              </svg>

              <input
                type="password"
                name="senha"
                className="wolf-input-field"
                placeholder="Password"
                autoComplete="current-password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
            </div>

            {/* BOTÕES */}
            <div className="wolf-btn-group">
              <button
                type="submit"
                className="wolf-btn wolf-btn-primary"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Login"}
              </button>

              <button
                type="button"
                className="wolf-btn wolf-btn-secondary"
                onClick={() => navigate("/signup")}
              >
                Cadastre-se
              </button>
            </div>

            {/* ENTRAR SEM LOGIN */}
            <button
              type="button"
              className="wolf-btn-forgot"
              onClick={() => navigate("/exercicios")}
            >
              Entrar sem Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}