import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div className="neu-card" style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 500, color: "var(--neu-text)", marginBottom: "8px" }}>
          HarvestTrack
        </h1>
        <p style={{ color: "var(--neu-text-soft)", fontSize: "14px", marginBottom: "22px" }}>
          Track contacts, Bible studies, and the journey to baptism.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link href="/login" className="neu-btn neu-btn-accent" style={{ textDecoration: "none", textAlign: "center" }}>
            Sign in
          </Link>
          <Link href="/register" className="neu-btn" style={{ textDecoration: "none", textAlign: "center" }}>
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}