
import authApi from "./authApi";

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface UserProfile {
  id?: string;
  _id?: string;
  nome?: string;
  name?: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export async function register(usuario: RegisterData) {
  const response = await authApi.post(
    "/auth/register",
    usuario
  );

  return response.data;
}

export async function login(usuario: LoginData) {
  const response = await authApi.post(
    "/auth/login",
    usuario
  );

  return response.data;
}

export async function getProfile(): Promise<UserProfile> {
  // Pega o token armazenado
  const rawToken = localStorage.getItem("@wolf:token") || localStorage.getItem("token");

  if (!rawToken || rawToken === "undefined" || rawToken === "null") {
    throw new Error("Token ausente ou inválido no localStorage.");
  }

  // Remove qualquer prefixo prévio e formata corretamente
  const cleanToken = rawToken.replace(/^Bearer\s+/i, "");
  
  const response = await authApi.get<UserProfile>("/profile", {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
    },
  });

  return response.data;
}