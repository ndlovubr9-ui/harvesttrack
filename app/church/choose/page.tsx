"use client";

import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function ChooseChurchPage() {
  const { checking } = useRequireAuth();
  const router = useRouter();

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="neu-card" style={{ color: "var(--neu-text-soft)", fontSize: "13px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="neu-card" style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "8px" }}>
          Get started
        </h1>
        <p style={{ color: "var(--neu-text-soft)", fontSize: "13px", marginBottom: "20px" }}>
          Are you setting up a new church, or joining one that already uses HarvestTrack?
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button onClick={() => router.push("/church")} className="neu-btn neu-btn-accent">
            Create a new church
          </button>
          <button onClick={() => router.push("/church/join")} className="neu-btn">
            Join an existing church
          </button>
        </div>
      </div>
    </main>
  );
}