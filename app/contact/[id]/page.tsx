"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/apiFetch";

type Contact = {
  id: string;
  name: string;
  age: number;
  phone: string;
  gender: string;
  location: string;
  status: string;
};

type Study = {
  id: string;
  topic: string;
  notes: string;
  date: string;
  nextDate: string;
};

export default function ContactDetailPage() {
  return (
    <AppShell>
      {() => <ContactDetailContent />}
    </AppShell>
  );
}

function ContactDetailContent() {
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const contactId = params.id;

  const [contact, setContact] = useState<Contact | null>(null);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!contactId) return;

    const loadData = async () => {
      try {
        const [contactRes, studiesRes] = await Promise.all([
          authFetch(`/api/contact/${contactId}`),
          authFetch(`/api/study?contactId=${encodeURIComponent(contactId)}`),
        ]);

        if (!contactRes.ok) throw new Error("Failed to load contact");
        if (!studiesRes.ok) throw new Error("Failed to load studies");

        setContact(await contactRes.json());
        setStudies(await studiesRes.json());
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [contactId]);

  const logStudy = async () => {
    if (!topic || !date || !nextDate) {
      showToast("Please fill in topic, date, and next date.", "error");
      return;
    }

    setSaving(true);

    try {
      const response = await authFetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, topic, notes, date, nextDate }),
      });

      if (!response.ok) {
        throw new Error("Failed to log study");
      }

      showToast("Study logged");
      setTopic("");
      setNotes("");
      setDate("");
      setNextDate("");

      const [contactRes, studiesRes] = await Promise.all([
        authFetch(`/api/contact/${contactId}`),
        authFetch(`/api/study?contactId=${encodeURIComponent(contactId)}`),
      ]);

      if (contactRes.ok) setContact(await contactRes.json());
      if (studiesRes.ok) setStudies(await studiesRes.json());
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to log study", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main style={{ padding: "2rem" }}>Loading...</main>;
  }

  if (error) {
    return <main style={{ padding: "2rem", color: "red" }}>{error}</main>;
  }

  if (!contact) {
    return <main style={{ padding: "2rem" }}>Contact not found.</main>;
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "700px" }}>
      <a href="/members">&larr; Back to Members</a>

      <h1>{contact.name}</h1>
      <p>
        Age {contact.age} &middot; {contact.phone} &middot; {contact.location}
      </p>
      <p>Status: {contact.status}</p>

      <h2>Bible Study History</h2>
      {studies.length === 0 && <p>No studies logged yet.</p>}
      {studies.length > 0 && (
        <ul>
          {studies.map((study) => (
            <li key={study.id}>
              <strong>{study.topic}</strong> —{" "}
              {new Date(study.date).toLocaleDateString()}
              {study.notes && <div>{study.notes}</div>}
              <div>
                Next session: {new Date(study.nextDate).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2>Log a New Study</h2>

      <input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
      <br /><br />

      <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <br /><br />

      <label>
        Date studied:{" "}
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <br /><br />

      <label>
        Next session:{" "}
        <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
      </label>
      <br /><br />

      <button onClick={logStudy} disabled={saving}>
        {saving ? "Saving..." : "Log Study"}
      </button>
    </main>
  );
}