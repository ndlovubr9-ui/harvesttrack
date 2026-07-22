"use client";

import { auth } from "@/lib/firebase";

/**
 * Like fetch(), but automatically attaches the current user's
 * Firebase ID token as a Bearer token.
 */
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}