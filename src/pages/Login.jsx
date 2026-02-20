import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login({ brand }) {
  const { signIn, signUp, supabaseConfigured } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!supabaseConfigured) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.");
      return;
    }

    setBusy(true);
    setError("");

    const action = mode === "signin" ? signIn : signUp;
    const { error: authError } = await action(email, password);

    if (authError) {
      setError(authError.message);
      setBusy(false);
      return;
    }

    setBusy(false);
    navigate("/app");
  }

  return (
    <main id="main" className="auth-shell">
      <div className="auth-card">
        <h2>{mode === "signin" ? "Sign in" : "Create account"} to {brand}</h2>
        <p>Access your compliance workspace and automation tools.</p>
        {!supabaseConfigured && (
          <div className="form-error" role="alert">
            Supabase auth is not configured. Create a `.env` file from `.env.example` and add your project URL and anon key.
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@company.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
            />
          </label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="btn" type="submit" disabled={busy || !supabaseConfigured}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === "signin" ? "No account yet?" : "Already have an account?"}
          <button
            type="button"
            className="link-button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </div>
      </div>
    </main>
  );
}
