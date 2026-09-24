"use client";

import { useRequireAuth } from "@/lib/useRequireAuth";
import { Nav } from "@/components/Nav";
import { User } from "firebase/auth";

export function AppShell({
  children,
}: {
  children: (user: User) => React.ReactNode;
}) {
  const { user, checking } = useRequireAuth();

  if (checking || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="neu-card" style={{ color: "var(--neu-text-soft)", fontSize: "13px" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <Nav />
      <div>{children(user)}</div>
    </>
  );
}