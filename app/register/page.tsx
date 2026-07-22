"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { authFetch } from "@/lib/apiFetch";
import { useToast } from "@/components/Toast";

export default function RegisterPage() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const { showToast } = useToast();

  async function register() {
    if (!firstname || !lastname || !email || !password) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const response = await authFetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname,
          lastname,
          email: userCredential.user.email,
        }),
      });

      if (!response.ok) {
        throw new Error(
          "Account was created but saving your profile failed."
        );
      }

      showToast("Account created successfully!", "success");

      setTimeout(() => {
        router.push("/church/choose");
      }, 1000);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to create account.",
        "error"
      );
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 py-10">
      {/* Background Glow */}
      <div className="absolute left-[-80px] top-1/4 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
      <div className="absolute right-[-80px] bottom-1/4 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Register</h1>
          <p className="mt-2 text-sm text-indigo-200">
            Create your HarvestTrack account.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            register();
          }}
          className="space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <input
                id="firstname"
                type="text"
                placeholder=" "
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="peer w-full rounded-xl border border-white/10 bg-white/5 px-4 pb-2 pt-6 text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
              />
              <label
                htmlFor="firstname"
                className="absolute left-4 top-2 text-xs text-indigo-200 transition peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs"
              >
                First Name
              </label>
            </div>

            <div className="relative">
              <input
                id="lastname"
                type="text"
                placeholder=" "
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="peer w-full rounded-xl border border-white/10 bg-white/5 px-4 pb-2 pt-6 text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
              />
              <label
                htmlFor="lastname"
                className="absolute left-4 top-2 text-xs text-indigo-200 transition peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs"
              >
                Last Name
              </label>
            </div>
          </div>

          <div className="relative">
            <input
              id="email"
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full rounded-xl border border-white/10 bg-white/5 px-4 pb-2 pt-6 text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
            />
            <label
              htmlFor="email"
              className="absolute left-4 top-2 text-xs text-indigo-200 transition peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs"
            >
              Email Address
            </label>
          </div>

          <div className="relative">
            <input
              id="password"
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full rounded-xl border border-white/10 bg-white/5 px-4 pb-2 pt-6 text-white outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20"
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-2 text-xs text-indigo-200 transition peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs"
            >
              Password
            </label>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-3 font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}