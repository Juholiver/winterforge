// services/treinoService.ts
import authApi from "./authApi";
import type {
  ApiResponse,
  FichaAgrupadaData,
  TreinoCriarData,
} from "../types/exercicio";

// ============================================================
// BUSCAR TREINOS DO USUÁRIO (AGRUPADOS POR A, B, C)
// GET /api/treinos
// ============================================================
export async function getTreinos(): Promise<ApiResponse<FichaAgrupadaData>> {
  const response = await authApi.get<ApiResponse<FichaAgrupadaData>>("/treinos");
  return response.data;
}

// ============================================================
// CRIAR EXERCÍCIO NA FICHA
// POST /api/treinos
// ============================================================
export async function criarTreino(treino: TreinoCriarData): Promise<ApiResponse<null>> {
  const response = await authApi.post<ApiResponse<null>>("/treinos", treino);
  return response.data;
}

// ============================================================
// DELETAR EXERCÍCIO DA FICHA
// DELETE /api/treinos/{id}
// ============================================================
export async function deletarTreino(id: number): Promise<ApiResponse<null>> {
  const response = await authApi.delete<ApiResponse<null>>(`/treinos/${id}`);
  return response.data;
}