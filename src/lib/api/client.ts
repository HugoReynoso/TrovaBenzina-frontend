const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ApiRequestInit = RequestInit & {
  next?: { revalidate?: number | false };
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(path: string, init?: ApiRequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const fetchInit: ApiRequestInit = {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers
    }
  };

  if (!init?.cache) {
    fetchInit.next = { revalidate: 300 };
  }

  const response = await fetch(`${API_BASE_URL}${path}`, fetchInit);

  if (!response.ok) {
    let message = `API request failed: ${response.status} ${response.statusText}`;

    try {
      const body = (await response.json()) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      // Keep the HTTP status message when the backend does not return JSON.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string, init?: ApiRequestInit): Promise<T> {
  return apiRequest<T>(path, init);
}
