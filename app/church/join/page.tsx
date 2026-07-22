"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    return <div style={{ padding: "3rem", textAlign: "center", color: "#666" }}>Loading...</div>;
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "600px" }}>
      <h1>Join a Church</h1>

      <input
        placeholder="Search church name..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          searchChurches(e.target.value);
        }}
      />

      <br /><br />

      {loading && <p>Loading...</p>}
      {!loading && churches.length === 0 && (
        <p>No churches found. Try a different search, or create a new one instead.</p>
      )}
      {!loading && churches.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {churches.map((church) => (
            <li key={church.id} style={{ marginBottom: "1rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
              <strong>{church.name}</strong>
              <div>{church.district}, {church.location}</div>
              <button onClick={() => join(church.id)} disabled={joiningId === church.id}>
                {joiningId === church.id ? "Joining..." : "Join"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <br />
      <a href="/church">Don&apos;t see your church? Create it instead</a>
    </main>
  );
}