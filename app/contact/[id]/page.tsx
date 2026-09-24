"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/apiFetch";
import { statusProgress } from "@/lib/pipeline";

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
    return <main style={{ padding: "2rem", color: "var(--neu-text-soft)" }}>Loading...</main>;
  }

  if (error) {
    return <main style={{ padding: "2rem", color: "var(--neu-danger)" }}>{error}</main>;
  }

  if (!contact) {
    return <main style={{ padding: "2rem", color: "var(--neu-text-soft)" }}>Contact not found.</main>;
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <Link href="/members" style={{ color: "var(--neu-text-soft)", fontSize: "13px", textDecoration: "none" }}>
        &larr; Back to members
      </Link>

      <div className="neu-card" style={{ margin: "16px 0" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "4px" }}>
          {contact.name}
        </h1>
        <p style={{ color: "var(--neu-text-soft)", fontSize: "13px", marginBottom: "14px" }}>
          {contact.age} &middot; {contact.phone} &middot; {contact.location}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ color: "var(--neu-text)", fontSize: "13px" }}>{contact.status}</span>
        </div>
        <div className="neu-progress-track">
          <div className="neu-progress-fill" style={{ width: `${statusProgress(contact.status)}%` }} />
        </div>
      </div>

      <div className="neu-card" style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "12px" }}>
          Bible study history
        </h2>
        {studies.length === 0 && (
          <p style={{ color: "var(--neu-text-soft)", fontSize: "13px" }}>No studies logged yet.</p>
        )}
        {studies.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {studies.map((study) => (
              <div key={study.id} className="neu-inset" style={{ padding: "10px 14px" }}>
                <div style={{ color: "var(--neu-text)", fontSize: "13px", fontWeight: 500 }}>
                  {study.topic} &middot; {new Date(study.date).toLocaleDateString()}
                </div>
                {study.notes && (
                  <div style={{ color: "var(--neu-text-soft)", fontSize: "12px", marginTop: "4px" }}>
                    {study.notes}
                  </div>
                )}
                <div style={{ color: "var(--neu-text-faint)", fontSize: "11px", marginTop: "4px" }}>
                  Next session: {new Date(study.nextDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="neu-card">
        <h2 style={{ fontSize: "15px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "12px" }}>
          Log a new study
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input className="neu-input" placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} />
          <textarea
            className="neu-input"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ resize: "vertical" }}
          />
          <label style={{ fontSize: "12px", color: "var(--neu-text-soft)" }}>
            Date studied
            <input className="neu-input" style={{ marginTop: "4px" }} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label style={{ fontSize: "12px", color: "var(--neu-text-soft)" }}>
            Next session
            <input className="neu-input" style={{ marginTop: "4px" }} type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
          </label>
          <button onClick={logStudy} disabled={saving} className="neu-btn neu-btn-accent">
            {saving ? "Saving..." : "Log study"}
          </button>
        </div>
      </div>
    </main>
  );
}