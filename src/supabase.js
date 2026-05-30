import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let clientInstance;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing! Initializing secure mock client fallback.");
  clientInstance = {
    auth: {
      signOut: async () => {
        console.log("Mock supabase auth signout executed.");
        return { error: null };
      },
      getUser: async () => {
        return { data: { user: null }, error: null };
      }
    }
  };
} else {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Critical: Failed to construct Supabase client, using mock fallback:", err);
    clientInstance = {
      auth: {
        signOut: async () => {
          return { error: null };
        },
        getUser: async () => {
          return { data: { user: null }, error: null };
        }
      }
    };
  }
}

export const supabase = clientInstance;
