"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/apiFetch";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";

type ChurchDetails = {
  id: string;
  name: string;
  conference: string;
  district: string;
  location: string;
};

type Member = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  points: number;
};

export default function ManageChurchPage() {
  return (
    <AppShell>
      {(user) => <ManageChurchContent user={user} />}
    </AppShell>
  );
}

function ManageChurchContent({ user }: { user: User }) {
  const { showToast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const [name, setName] = useState("");
  const [conference, setConference] = useState("");
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState("");
  const [savingChurch, setSavingChurch] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const usersRes = await authFetch("/api/users");

        if (usersRes.status === 403) {
          setForbidden(true);
          return;
        }

        if (!usersRes.ok) {
          throw new Error("Failed to load members");
        }

        const usersData: Member[] = await usersRes.json();
        setMembers(usersData);

        const me = usersData.find((m) => m.email === user.email);
        if (me) setCurrentUserId(me.id);

        const churchRes = await authFetch("/api/church/mine");
        if (churchRes.ok) {
          const churchData: ChurchDetails = await churchRes.json();
          setName(churchData.name);
          setConference(churchData.conference);
          setDistrict(churchData.district);
          setLocation(churchData.location);
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to load", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, showToast]);

  const saveChurch = async () => {
    setSavingChurch(true);
    try {
      const response = await authFetch("/api/church", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, conference, district, location }),
      });

      if (!response.ok) {
        throw new Error("Failed to update church");
      }

      showToast("Church details updated!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update church", "error");
    } finally {
      setSavingChurch(false);
    }
  };

  const changeRole = async (memberId: string, newRole: string) => {
    const previous = members;

    setMembers((current) =>
      current.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );

    try {
      const response = await authFetch(`/api/users/${memberId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to update role");
      }

      showToast("Role updated");
    } catch (err) {
      setMembers(previous);
      showToast(err instanceof Error ? err.message : "Failed to update role", "error");
    }
  };

  if (loading) {
    return <main style={{ padding: "2rem", color: "var(--neu-text-soft)" }}>Loading...</main>;
  }

  if (forbidden) {
    return (
      <main style={{ padding: "2rem" }}>
        <div className="neu-card" style={{ maxWidth: "420px" }}>
          <p style={{ color: "var(--neu-text)", fontSize: "14px", marginBottom: "14px" }}>
            Only church admins can access this page.
          </p>
          <button onClick={() => router.push("/dashboard")} className="neu-btn">
            Back to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "20px" }}>
        Manage church
      </h1>

      <div className="neu-card" style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "4px" }}>
          Church details
        </h2>
        <p style={{ color: "var(--neu-text-soft)", fontSize: "12px", marginBottom: "14px" }}>
          Update your church&apos;s details below.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input className="neu-input" placeholder="Church name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="neu-input" placeholder="Conference / mission" value={conference} onChange={(e) => setConference(e.target.value)} />
          <input className="neu-input" placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)} />
          <input className="neu-input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <button onClick={saveChurch} disabled={savingChurch} className="neu-btn neu-btn-accent">
            {savingChurch ? "Saving..." : "Update church"}
          </button>
        </div>
      </div>

      <div className="neu-card">
        <h2 style={{ fontSize: "15px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "14px" }}>
          Members
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {members.map((member) => (
            <div key={member.id} className="neu-inset" style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: "var(--neu-text)", fontSize: "13px", fontWeight: 500 }}>
                  {member.firstname} {member.lastname}
                </div>
                <div style={{ color: "var(--neu-text-soft)", fontSize: "12px" }}>
                  {member.email} &middot; {member.points} pts
                </div>
              </div>
              <select
                className="neu-select"
                value={member.role}
                onChange={(e) => changeRole(member.id, e.target.value)}
                disabled={member.id === currentUserId}
              >
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}