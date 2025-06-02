import { QueryClient } from "@tanstack/react-query";
import { BASE_API_URL } from "./constants";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    let text;
    try {
      text = await res.text();
    } catch (e) {
      text = res.statusText;
    }
    let message = `${res.status}: ${text}`;
    try {
      const json = JSON.parse(text);
      if (json.message) message = `${res.status}: ${json.message}`;
    } catch {}
    throw new Error(message);
  }
}

export async function apiRequest(method, url, data) {
  const user = JSON.parse(localStorage.getItem("sweetspot_user") || "{}");
  const token = user?.token;
  let fullUrl = url.startsWith("/api") ? `${BASE_API_URL}${url}` : url;
  let headers = {};
  if (data && !(data instanceof FormData)) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data && !(data instanceof FormData) ? JSON.stringify(data) : data instanceof FormData ? data : undefined,
    credentials: "include",
  });
  await throwIfResNotOk(res);
  if (res.status === 204) return null;
  return await res.json();
}

export const getQueryFn =
  ({ on401 }) =>
  async ({ queryKey }) => {
    try {
      return await apiRequest("GET", queryKey[0]);
    } catch (err) {
      if (on401 === "returnNull" && err.message.startsWith("401")) {
        return null;
      }
      throw err;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
