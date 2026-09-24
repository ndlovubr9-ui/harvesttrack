"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const login = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to sign in",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div className="neu-card" style={{ width: "100%", maxWidth: "420px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "4px" }}>
          Welcome back
        </h1>
        <p style={{ color: "var(--neu-text-soft)", fontSize: "13px", marginBottom: "22px" }}>
          Sign in to access your account.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input
            className="neu-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="neu-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={login} disabled={loading} className="neu-btn neu-btn-accent">
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <Link href="/register" className="register-signin-link">
            Don&apos;t have an account? Register
          </Link>
        </div>
      </div>
    </main>
  );
}