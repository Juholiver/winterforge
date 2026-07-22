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