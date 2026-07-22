"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async () => {
    try {
      const user = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      };
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10">
  
  {/* Ambient Background Glows */}
  <div className="absolute top-1/4 -left-20 h-72 w-72 animate-pulse rounded-full bg-indigo-500/20 blur-3xl"></div>
  <div className="absolute bottom-1/4 -right-20 h-72 w-72 animate-pulse rounded-full bg-purple-500/20 blur-3xl delay-1000"></div>

  {/* Main Card with Entry Fade/Slide */}
  <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out rounded-3xl bg-white/10 p-8 sm:p-10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-indigo-950/50">
    
    {/* Header */}
    <div className="mb-8 text-center sm:text-left">
      <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        Welcome Back
      </h1>
      <p className="mt-2 text-sm text-indigo-200/80">
        Sign in to access your account.
      </p>
    </div>

    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      
      {/* Email Input */}
      <div className="group relative">
        <input
          type="email"
          id="login-email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder=" "
          className="peer w-full rounded-xl border border-white/10 bg-white/5 px-4 pt-6 pb-2 text-sm text-white placeholder-transparent backdrop-blur-md outline-none transition-all duration-300 focus:border-indigo-400 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20"
        />
        <label
          htmlFor="login-email"
          className="absolute left-4 top-2 text-xs font-medium text-indigo-200 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-300"
        >
          Email Address
        </label>
      </div>

      {/* Password Input */}
      <div className="group relative">
        <input
          type="password"
          id="login-password"
          onChange={(e) => setPassword(e.target.value)}
          placeholder=" "
          className="peer w-full rounded-xl border border-white/10 bg-white/5 px-4 pt-6 pb-2 text-sm text-white placeholder-transparent backdrop-blur-md outline-none transition-all duration-300 focus:border-indigo-400 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20"
        />
        <label
          htmlFor="login-password"
          className="absolute left-4 top-2 text-xs font-medium text-indigo-200 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-300"
        >
          Password
        </label>
      </div>

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <a
          href="#"
          className="text-xs font-medium text-indigo-300 transition-colors hover:text-indigo-200 hover:underline"
        >
          Forgot password?
        </a>
      </div>

      {/* Animated Action Button */}
      <button
        type="button"
        onClick={login}
        className="group relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[2px] font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-slate-900/40 px-4 py-3.5 text-sm backdrop-blur-md transition-colors duration-300 group-hover:bg-transparent">
          <span>Sign In</span>
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
      </button>

    </form>
  </div>
</div>
  );
}