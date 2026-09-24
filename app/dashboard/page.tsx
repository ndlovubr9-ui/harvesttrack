"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { authFetch } from "@/lib/apiFetch";

type Stats = { contacts: number; studies: number; baptismPrep: number; totalPoints: number };

export default function Dashboard() {
  return (
    <AppShell>
      {() => <DashboardContent />}
    </AppShell>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await authFetch("/api/stats");
        if (response.ok) setStats(await response.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    { label: "Contacts", value: stats?.contacts },
    { label: "Bible studies", value: stats?.studies },
    { label: "Preparing for baptism", value: stats?.baptismPrep },
    { label: "Total points", value: stats?.totalPoints },
  ];

  return (
    <main style={{ padding: "2rem", maxWidth: "760px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "4px" }}>
        Dashboard
      </h1>
      <p style={{ color: "var(--neu-text-soft)", fontSize: "14px", marginBottom: "24px" }}>
        Welcome back to HarvestTrack.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
        {cards.map((card) => (
          <div key={card.label} className="neu-card">
            <div style={{ color: "var(--neu-text-soft)", fontSize: "12px", marginBottom: "6px" }}>
              {card.label}
            </div>
            <div style={{ color: "var(--neu-text)", fontSize: "28px", fontWeight: 500 }}>
              {loading ? "—" : card.value ?? 0}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}