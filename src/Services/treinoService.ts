import authApi from "./authApi";
import type { TreinoBackendItem } from '../types/exercicio';

export interface TreinoCriarData {
  exercicioId: number;
  nomeExercicio: string;
  divisao: string;
  series: number;
  repeticoes: string;
  carga: string;
  descanso: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================
// BUSCAR TREINOS DO USUÁRIO
// GET /api/treinos
// ============================================================

export async function getTreinos() {
  const response = await authApi.get<ApiResponse<Record<string, TreinoBackendItem[]> | TreinoBackendItem[]>>(
    "/treinos"
  );

  return response.data;
}

// ============================================================
// CRIAR TREINO
// POST /api/treinos
// ============================================================

export async function criarTreino(treino: TreinoCriarData) {
  const response = await authApi.post<ApiResponse<any>>(
    "/treinos",
    treino
  );
  console.log("=== RESPOSTA DO POST (criarTreino) ===", response.data);
  return response.data;
}

// ============================================================
// DELETAR TREINO
// DELETE /api/treinos/{id}
// ============================================================

export async function deletarTreino(
  id: number
) {
  const response =
    await authApi.delete<ApiResponse<null>>(
      `/treinos/${id}`
    );

  return response.data;
}