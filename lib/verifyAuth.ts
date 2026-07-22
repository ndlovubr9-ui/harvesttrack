import { adminAuth } from "@/lib/firebaseAdmin";

/**
 * Verifies the Firebase ID token sent in the Authorization header.
 * Returns the verified uid, or null if missing/invalid.
 */
export async function verifyRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}