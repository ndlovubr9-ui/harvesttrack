"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/apiFetch";

export default function ChurchPage() {
  const { checking } = useRequireAuth();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [conference, setConference] = useState("");
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();

  const saveChurch = async () => {
    try {
      const response = await authFetch("/api/church", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, conference, district, location }),
      });

      if (!response.ok) {
        throw new Error("Failed to save church");
      }

      showToast("Church saved successfully!");
      router.push("/dashboard");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to save church", "error");
    }
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="neu-card" style={{ color: "var(--neu-text-soft)", fontSize: "13px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="neu-card" style={{ width: "100%", maxWidth: "440px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "18px" }}>
          Create your church
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input className="neu-input" placeholder="Church name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="neu-input" placeholder="Conference / mission" value={conference} onChange={(e) => setConference(e.target.value)} />
          <input className="neu-input" placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)} />
          <input className="neu-input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <button onClick={saveChurch} className="neu-btn neu-btn-accent">Save church</button>
          <Link href="/church/join" style={{ color: "var(--neu-text-soft)", fontSize: "12px", textAlign: "center", textDecoration: "none" }}>
            Already part of a church? Join instead
          </Link>
        </div>
      </div>
    </main>
  );
}