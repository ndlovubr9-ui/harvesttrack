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
    return <main style={{ padding: "2rem" }}>Loading...</main>;
  }

  if (forbidden) {
    return (
      <main style={{ padding: "2rem" }}>
        <p>Only church admins can access this page.</p>
        <button onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "700px" }}>
      <h1>Manage Church</h1>

      <h2>Church Details</h2>
      <p style={{ color: "#666" }}>Re-enter your church&apos;s details below to update them.</p>

      <input placeholder="Church Name" value={name} onChange={(e) => setName(e.target.value)} />
      <br /><br />
      <input placeholder="Conference / Mission" value={conference} onChange={(e) => setConference(e.target.value)} />
      <br /><br />
      <input placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)} />
      <br /><br />
      <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <br /><br />
      <button onClick={saveChurch} disabled={savingChurch}>
        {savingChurch ? "Saving..." : "Update Church"}
      </button>

      <h2>Members</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Name</th>
            <th style={{ textAlign: "left" }}>Email</th>
            <th style={{ textAlign: "left" }}>Points</th>
            <th style={{ textAlign: "left" }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.firstname} {member.lastname}</td>
              <td>{member.email}</td>
              <td>{member.points}</td>
              <td>
                <select
                  value={member.role}
                  onChange={(e) => changeRole(member.id, e.target.value)}
                  disabled={member.id === currentUserId}
                >
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}