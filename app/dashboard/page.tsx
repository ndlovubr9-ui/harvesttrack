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

  return (
    <main style={{ padding: "2rem" }}>
      <h1>HarvestTrack Dashboard</h1>
      <p>Welcome to HarvestTrack.</p>

      <div>
        <h2>Statistics</h2>
        <ul>
          <li>Contacts: {loading ? "..." : stats?.contacts ?? 0}</li>
          <li>Bible Studies: {loading ? "..." : stats?.studies ?? 0}</li>
          <li>People Preparing for Baptism: {loading ? "..." : stats?.baptismPrep ?? 0}</li>
          <li>Total Points: {loading ? "..." : stats?.totalPoints ?? 0}</li>
        </ul>
      </div>
    </main>
  );
}