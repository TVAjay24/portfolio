import { supabase } from "./supabase";
import { API_BASE } from "./config";

export const apiFetch = async (endpoint, options = {}) => {
  let token = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  } catch (err) {
    console.warn("Failed to fetch auth session:", err);
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `API error! Status: ${response.status}`);
  }

  return response.json();
};
