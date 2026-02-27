import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export const api = async <T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (options.auth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};