"use client";

import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";

export default function ChooseChurchPage() {
  const { checking } = useRequireAuth();
  const router = useRouter();

  if (checking) {
    return null;
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "500px" }}>
      <h1>Get Started</h1>
      <p>Are you setting up a new church, or joining one that already uses HarvestTrack?</p>

      <button onClick={() => router.push("/church")}>
        Create a New Church
      </button>

      <br /><br />

      <button onClick={() => router.push("/church/join")}>
        Join an Existing Church
      </button>
    </main>
  );
}