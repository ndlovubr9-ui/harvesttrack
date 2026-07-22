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
      <div style={{ padding: "3rem", textAlign: "center", color: "#666" }}>
        Loading...
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