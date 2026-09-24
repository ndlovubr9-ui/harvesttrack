"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/apiFetch";

type Church = {
  id: string;
  name: string;
  conference: string;
  district: string;
  location: string;
};

export default function JoinChurchPage() {
  const { checking } = useRequireAuth();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const router = useRouter();

  const searchChurches = async (q: string) => {
    setLoading(true);
    try {
      const response = await authFetch(`/api/church?q=${encodeURIComponent(q)}`);
      if (response.ok) {
        setChurches(await response.json());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checking) return;

    const search = async () => {
      setLoading(true);
      try {
        const response = await authFetch(`/api/church?q=`);
        if (response.ok) {
          setChurches(await response.json());
        }
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [checking]);

  const join = async (churchId: string) => {
    setJoiningId(churchId);
    try {
      const response = await authFetch("/api/church/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churchId }),
      });

      if (!response.ok) {
        throw new Error("Failed to join church");
      }

      showToast("Joined church!");
      router.push("/dashboard");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to join church", "error");
    } finally {
      setJoiningId(null);
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
    <main style={{ minHeight: "100vh", padding: "2rem", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "16px" }}>
          Join a church
        </h1>

        <input
          className="neu-input"
          placeholder="Search church name..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchChurches(e.target.value);
          }}
          style={{ marginBottom: "16px" }}
        />

        {loading && <p style={{ color: "var(--neu-text-soft)", fontSize: "13px" }}>Loading...</p>}
        {!loading && churches.length === 0 && (
          <p style={{ color: "var(--neu-text-soft)", fontSize: "13px" }}>
            No churches found. Try a different search, or create a new one instead.
          </p>
        )}

        {!loading && churches.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {churches.map((church) => (
              <div key={church.id} className="neu-card-sm" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: "var(--neu-text)", fontSize: "13px", fontWeight: 500 }}>{church.name}</div>
                  <div style={{ color: "var(--neu-text-soft)", fontSize: "12px" }}>{church.district}, {church.location}</div>
                </div>
                <button onClick={() => join(church.id)} disabled={joiningId === church.id} className="neu-btn neu-btn-accent" style={{ fontSize: "12px", padding: "6px 14px" }}>
                  {joiningId === church.id ? "Joining..." : "Join"}
                </button>
              </div>
            ))}
          </div>
        )}

        <Link href="/church" style={{ display: "block", marginTop: "18px", color: "var(--neu-text-soft)", fontSize: "12px", textAlign: "center", textDecoration: "none" }}>
          Don&apos;t see your church? Create it instead
        </Link>
      </div>
    </main>
  );
}