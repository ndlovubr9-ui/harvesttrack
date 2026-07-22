"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function Nav() {
  const router = useRouter();

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        gap: "1.25rem",
        alignItems: "center",
        padding: "1rem 2rem",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      <a href="/dashboard" style={{ fontWeight: 600 }}>HarvestTrack</a>
      <a href="/dashboard">Dashboard</a>
      <a href="/members">Members</a>
      <a href="/contact">Add Contact</a>
      <a href="/church/manage">Manage Church</a>
      <span style={{ flex: 1 }} />
      <button onClick={logout}>Logout</button>
    </nav>
  );
}