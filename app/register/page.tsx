"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authFetch } from "@/lib/apiFetch";
import { useToast } from "@/components/Toast";

export default function RegisterPage() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const register = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const response = await authFetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname,
          lastname,
          email: userCredential.user.email,
        }),
      });

      if (!response.ok) {
        throw new Error(
          "Account was created but saving your profile failed. Please contact support."
        );
      }

      router.push("/church/choose");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to create account",
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
      <div className="neu-card" style={{ width: "100%", maxWidth: "460px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "4px" }}>
          Register
        </h1>
        <p style={{ color: "var(--neu-text-soft)", fontSize: "13px", marginBottom: "22px" }}>
          Create your HarvestTrack account.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <input
              className="neu-input"
              placeholder="First name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
            <input
              className="neu-input"
              placeholder="Last name"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
          </div>

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

          <button onClick={register} disabled={loading} className="neu-btn neu-btn-accent">
            {loading ? "Creating account..." : "Create account"}
          </button>

          <Link href="/login" className="register-signin-link">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}