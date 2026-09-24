"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/members", label: "Members" },
  { href: "/contact", label: "Add contact" },
  { href: "/church/manage", label: "Manage church" },
];

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "14px 28px",
        background: "var(--neu-bg)",
        boxShadow: "0 6px 14px var(--neu-shadow-dark)",
      }}
    >
      <span style={{ fontWeight: 500, fontSize: "15px", color: "var(--neu-text)", marginRight: "12px" }}>
        HarvestTrack
      </span>

      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "neu-inset" : ""}
            style={{
              padding: "6px 14px",
              borderRadius: "10px",
              fontSize: "13px",
              color: active ? "var(--neu-accent)" : "var(--neu-text-soft)",
              fontWeight: active ? 500 : 400,
              textDecoration: "none",
            }}
          >
            {link.label}
          </Link>
        );
      })}

      <span style={{ flex: 1 }} />

      <button onClick={logout} className="neu-btn">
        Log out
      </button>
    </nav>
  );
}
