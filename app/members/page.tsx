"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/apiFetch";
import { STATUS_OPTIONS, statusProgress } from "@/lib/pipeline";

type Contact = {
  id: string; name: string; age: number; phone: string;
  gender: string; location: string; status: string; progress: number;
};

export default function MembersPage() {
  return (
    <AppShell>
      {() => <MembersContent />}
    </AppShell>
  );
}

function MembersContent() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const response = await authFetch("/api/contact");
        if (!response.ok) throw new Error("Failed to load contacts");
        setContacts(await response.json());
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateStatus = async (contactId: string, newStatus: string) => {
    const previous = contacts;
    setContacts((current) =>
      current.map((c) => (c.id === contactId ? { ...c, status: newStatus } : c))
    );

    try {
      const response = await authFetch(`/api/contact/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      showToast("Status updated");
    } catch (err) {
      setContacts(previous);
      showToast(err instanceof Error ? err.message : "Failed to update status", "error");
    }
  };

  const deleteContact = async (contactId: string, name: string) => {
    if (!confirm(`Delete ${name}? This can't be undone from the UI.`)) {
      return;
    }

    try {
      const response = await authFetch(`/api/contact/${contactId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete contact");
      }

      setContacts((current) => current.filter((c) => c.id !== contactId));
      showToast(`${name} deleted`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete contact", "error");
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "20px" }}>
        Church members
      </h1>

      {loading && <p style={{ color: "var(--neu-text-soft)", fontSize: "14px" }}>Loading...</p>}
      {error && <p style={{ color: "var(--neu-danger)", fontSize: "14px" }}>{error}</p>}
      {!loading && !error && contacts.length === 0 && (
        <p style={{ color: "var(--neu-text-soft)", fontSize: "14px" }}>No members yet.</p>
      )}

      {!loading && contacts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {contacts.map((contact) => (
            <div key={contact.id} className="neu-card-sm">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className="neu-avatar" style={{ width: "36px", height: "36px", fontSize: "13px" }}>
                    {contact.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: "var(--neu-text)", fontSize: "14px", fontWeight: 500 }}>
                      {contact.name}
                    </div>
                    <div style={{ color: "var(--neu-text-soft)", fontSize: "12px" }}>
                      {contact.age} &middot; {contact.phone} &middot; {contact.location}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <select
                    className="neu-select"
                    value={contact.status}
                    onChange={(e) => updateStatus(contact.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <Link href={`/contacts/${contact.id}`} className="neu-btn" style={{ textDecoration: "none", fontSize: "12px", padding: "6px 12px" }}>
                    View
                  </Link>
                  <button
                    onClick={() => deleteContact(contact.id, contact.name)}
                    className="neu-btn"
                    style={{ fontSize: "12px", padding: "6px 12px", color: "var(--neu-danger)" }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="neu-progress-track">
                <div
                  className="neu-progress-fill"
                  style={{ width: `${statusProgress(contact.status)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}