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
    <main style={{ padding: "2rem" }}>
      <h1>Contacts</h1>
      <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <br /><br />
      <input placeholder="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
      <br /><br />
      <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <br /><br />
      <input placeholder="Gender" value={gender} onChange={(e) => setGender(e.target.value)} />
      <br /><br />
      <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <br /><br />
      <button onClick={saveContact} disabled={saving}>{saving ? "Saving..." : "Save Contact"}</button>
    </main>
  );
}