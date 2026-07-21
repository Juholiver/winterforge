import authApi from "./authApi";

export interface RegisterData {
  nome: string;
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