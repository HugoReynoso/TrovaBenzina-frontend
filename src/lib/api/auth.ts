import { apiRequest } from "./client";

interface LoginResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
}

export async function loginAdmin(email: string, password: string): Promise<string> {
  const response = await apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });

  const token = response.token ?? response.accessToken ?? response.jwt;

  if (!token) {
    throw new Error("Il servizio non ha restituito un token valido.");
  }

  return token;
}
