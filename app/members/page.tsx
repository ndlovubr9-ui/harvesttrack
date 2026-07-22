"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/apiFetch";

type Contact = {
  id: string; name: string; age: number; phone: string;
  gender: string; location: string; status: string; progress: number;
};

const STATUS_OPTIONS = ["New Contact", "Studying", "Preparing for Baptism", "Baptized"];

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
    <main style={{ padding: "2rem" }}>
      <h1>Church Members</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && contacts.length === 0 && <p>No members yet.</p>}
      {!loading && contacts.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Name</th>
              <th style={{ textAlign: "left" }}>Age</th>
              <th style={{ textAlign: "left" }}>Phone</th>
              <th style={{ textAlign: "left" }}>Location</th>
              <th style={{ textAlign: "left" }}>Status</th>
              <th style={{ textAlign: "left" }}></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>{contact.name}</td>
                <td>{contact.age}</td>
                <td>{contact.phone}</td>
                <td>{contact.location}</td>
                <td>
                  <select value={contact.status} onChange={(e) => updateStatus(contact.id, e.target.value)}>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <a href={`/contacts/${contact.id}`}>View</a>
                  {" · "}
                  <button onClick={() => deleteContact(contact.id, contact.name)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}