"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/apiFetch";

export default function ContactPage() {
  return (
    <AppShell>
      {() => <ContactForm />}
    </AppShell>
  );
}

function ContactForm() {
  const { showToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const saveContact = async () => {
    if (!name || !age || !phone) {
      showToast("Please fill in at least name, age, and phone.", "error");
      return;
    }

    setSaving(true);

    try {
      const response = await authFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age, phone, gender, location }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to save contact");
      }

      showToast("Contact saved!");
      setName(""); setAge(""); setPhone(""); setGender(""); setLocation("");
      router.push("/members");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to save contact", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "480px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "20px" }}>
        Add a contact
      </h1>

      <div className="neu-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <input className="neu-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="neu-input" placeholder="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        <input className="neu-input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="neu-input" placeholder="Gender" value={gender} onChange={(e) => setGender(e.target.value)} />
        <input className="neu-input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <button onClick={saveContact} disabled={saving} className="neu-btn neu-btn-accent">
          {saving ? "Saving..." : "Save contact"}
        </button>
      </div>
    </main>
  );
}