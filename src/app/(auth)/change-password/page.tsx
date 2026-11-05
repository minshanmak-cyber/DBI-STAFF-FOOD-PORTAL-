"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Utensils,
  QrCode,
  History,
  LogOut,
  User,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";

interface UserProfile {
  id: string;
  staffId: string;
  role: "ADMIN" | "STAFF" | "CANTEEN";
  fullName: string;
  department?: string | null;
}

function ChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstLogin = searchParams.get("firstLogin") === "true";

  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unauthenticated");
      })
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      })
      .catch(() => setUser(null));
  }, []);

  const getDashboardPath = () => {
    if (!user) return "/staff";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "CANTEEN") return "/canteen";
    return "/staff";
  };

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(getDashboardPath());
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: isFirstLogin ? "initial" : currentPassword,
          newPassword,
          confirmPassword,
          isFirstLogin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update password. Please check your inputs.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(data.redirectTo || getDashboardPath());
        router.refresh();
      }, 1000);
    } catch (err) {
      setError("Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Sticky Liquid Glass Top Navigation Bar */}
      <header className="sticky top-0 z-40 liquid-glass border-b border-white/60 transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isFirstLogin ? (
              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-bold border border-slate-200/90 shadow-xs active:scale-95 transition-all duration-200"
                aria-label="Go Back to Portal"
              >
                <ChevronLeft className="w-4 h-4 text-sky-600 stroke-[2.5]" />
                <span>Go Back</span>
              </button>
            ) : (
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg">
                First Login Setup
              </span>
            )}
          </div>

          <div className="text-center font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
            Account & Security
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-block font-mono bg-slate-100/90 border border-slate-200/60 px-2 py-0.5 rounded-lg text-slate-800 font-extrabold text-xs">
                  {user.staffId}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 sm:px-2.5 sm:py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50/80 border border-transparent hover:border-rose-100 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4 sm:hidden" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : isFirstLogin ? (
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800"
              >
                Cancel & Sign Out
              </button>
            ) : (
              <div className="w-16" />
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 pb-32 md:pb-12 max-w-md w-full mx-auto">
        {/* Card Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex bg-slate-900 text-sky-400 p-3 rounded-2xl shadow-md">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {isFirstLogin ? "Set Your Personal Password" : "Change Account Password"}
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium max-w-sm mx-auto">
            {isFirstLogin
              ? "For security, you must update your temporary initial password before proceeding."
              : "Update your institutional credentials below to keep your account secure."}
          </p>
        </div>

        {/* Password Form Card */}
        <div className="mt-5 bg-white py-6 px-6 sm:px-8 shadow-sm border border-slate-200 rounded-3xl">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-800 text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Password updated successfully! Redirecting to portal...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isFirstLogin && (
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                >
                  Current Password
                </label>
                <div className="mt-1.5">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="newPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                New Password
              </label>
              <div className="mt-1.5">
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 digit"
                  className="block w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Must be at least 8 characters with at least one uppercase letter and one number.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Confirm New Password
              </label>
              <div className="mt-1.5">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="block w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-sky-400" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <span>Confirm & Update Password</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>

              {!isFirstLogin && (
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition active:scale-98"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  <span>Cancel & Return to Portal</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* iOS 27 Liquid Glass Floating Capsule Dock for Staff on Mobile */}
      {!isFirstLogin && (!user || user.role === "STAFF") && (
        <nav
          aria-label="Staff Floating Liquid Navigation"
          className="md:hidden fixed bottom-5 left-4 right-4 sm:left-6 sm:right-6 max-w-[340px] sm:max-w-[360px] mx-auto z-50 liquid-capsule-dock p-1.5 transition-all duration-300"
        >
          <div className="grid grid-cols-4 items-center justify-between gap-1">
            <Link
              href="/staff"
              className="flex flex-col items-center justify-center py-2 px-1 rounded-[22px] transition-all duration-200 active:scale-95 text-slate-800 hover:text-slate-950"
            >
              <Utensils className="w-[22px] h-[22px] text-slate-800 stroke-[2]" />
              <span className="text-[11px] mt-1 tracking-tight leading-none font-semibold text-slate-800">
                Meals
              </span>
              <div className="w-[14px] h-[4px] mt-1 opacity-0 pointer-events-none" />
            </Link>

            <Link
              href="/staff/qr"
              className="flex flex-col items-center justify-center py-2 px-1 rounded-[22px] transition-all duration-200 active:scale-95 text-slate-800 hover:text-slate-950"
            >
              <QrCode className="w-[22px] h-[22px] text-slate-800 stroke-[2]" />
              <span className="text-[11px] mt-1 tracking-tight leading-none font-semibold text-slate-800">
                My QR
              </span>
              <div className="w-[14px] h-[4px] mt-1 opacity-0 pointer-events-none" />
            </Link>

            <Link
              href="/staff/history"
              className="flex flex-col items-center justify-center py-2 px-1 rounded-[22px] transition-all duration-200 active:scale-95 text-slate-800 hover:text-slate-950"
            >
              <History className="w-[22px] h-[22px] text-slate-800 stroke-[2]" />
              <span className="text-[11px] mt-1 tracking-tight leading-none font-semibold text-slate-800">
                History
              </span>
              <div className="w-[14px] h-[4px] mt-1 opacity-0 pointer-events-none" />
            </Link>

            <div className="flex flex-col items-center justify-center py-2 px-1 rounded-[22px] transition-all duration-200 active:scale-95 liquid-tab-active">
              <User className="w-[22px] h-[22px] text-[#0284c7] stroke-[2.3]" />
              <span className="text-[11px] mt-1 tracking-tight leading-none font-bold text-[#0284c7]">
                Account
              </span>
              <div className="liquid-dash-indicator mt-1" />
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
        </div>
      }
    >
      <ChangePasswordContent />
    </Suspense>
  );
}