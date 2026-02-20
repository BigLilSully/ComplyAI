import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isPlaceholder = (value = "") =>
  value.includes("YOUR-PROJECT-REF") ||
  value.includes("YOUR_SUPABASE_ANON_KEY") ||
  value.includes("YOUR_");

const hasValidSupabaseUrl = (value = "") =>
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value);

const hasValidAnonKey = (value = "") =>
  typeof value === "string" && value.length > 20 && !isPlaceholder(value);

export const hasSupabaseConfig =
  hasValidSupabaseUrl(supabaseUrl || "") && hasValidAnonKey(supabaseAnonKey || "");

if (!hasSupabaseConfig) {
  console.warn("[supabase] Missing or invalid VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.");
}

const missingConfigError = () => ({
  error: {
    message: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    code: "supabase_not_configured"
  }
});

const createNoopSubscription = () => ({ unsubscribe: () => {} });

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: createNoopSubscription() } }),
        signUp: async () => missingConfigError(),
        signInWithPassword: async () => missingConfigError(),
        signOut: async () => ({ error: null })
      },
      from: () => ({
        select: () => Promise.resolve(missingConfigError()),
        insert: () => Promise.resolve(missingConfigError()),
        update: () => Promise.resolve(missingConfigError()),
        delete: () => Promise.resolve(missingConfigError())
      })
    };
