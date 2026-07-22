import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!getApps().length) {
  console.log("Starts correctly:", privateKey?.startsWith("-----BEGIN PRIVATE KEY-----"));
console.log("Ends correctly:", privateKey?.trim().endsWith("-----END PRIVATE KEY-----"));
console.log("Length:", privateKey?.length);
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export const adminAuth = getAuth();