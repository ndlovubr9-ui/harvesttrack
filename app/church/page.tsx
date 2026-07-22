"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useToast } from "@/components/Toast";
import { authFetch } from "@/lib/apiFetch";

export default function ChurchPage() {
  const { checking } = useRequireAuth();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [conference, setConference] = useState("");
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();

  const saveChurch = async () => {
    try {
      const response = await authFetch("/api/church", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, conference, district, location }),
      });

      if (!response.ok) {
        throw new Error("Failed to save church");
      }

      showToast("Church saved successfully!");
      router.push("/dashboard");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to save church", "error");
    }
  };

  if (checking) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "#666" }}>Loading...</div>;
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "600px" }}>
      <h1>Create Your Church</h1>
      <input placeholder="Church Name" value={name} onChange={(e) => setName(e.target.value)} />
      <br /><br />
      <input placeholder="Conference / Mission" value={conference} onChange={(e) => setConference(e.target.value)} />
      <br /><br />
      <input placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)} />
      <br /><br />
      <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <br /><br />
      <button onClick={saveChurch}>Save Church</button>
      <br /><br />
      <a href="/church/join">Already part of a church? Join instead</a>
    </main>
  );
}