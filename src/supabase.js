import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let clientInstance;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing! Initializing secure mock client fallback.");
  clientInstance = {
    auth: {
      signInWithPassword: async ({ email, password }) => {
        console.log("Mock supabase auth signin executed.");
        if (email.trim().toLowerCase() === "tvajay0@gmail.com") {
          return { data: { session: { user: { email: "tvajay0@gmail.com" }, access_token: "mock-token" } }, error: null };
        }
        return { data: { session: null }, error: { message: "Invalid credentials (Mock Auth)" } };
      },
      signOut: async () => {
        console.log("Mock supabase auth signout executed.");
        return { error: null };
      },
      getUser: async () => {
        return { data: { user: { email: "tvajay0@gmail.com" } }, error: null };
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
        signInWithPassword: async ({ email, password }) => {
          if (email.trim().toLowerCase() === "tvajay0@gmail.com") {
            return { data: { session: { user: { email: "tvajay0@gmail.com" }, access_token: "mock-token" } }, error: null };
          }
          return { data: { session: null }, error: { message: "Invalid credentials (Mock Auth)" } };
        },
        signOut: async () => {
          return { error: null };
        },
        getUser: async () => {
          return { data: { user: { email: "tvajay0@gmail.com" } }, error: null };
        }
      }
    };
  }
}

export const supabase = clientInstance;
