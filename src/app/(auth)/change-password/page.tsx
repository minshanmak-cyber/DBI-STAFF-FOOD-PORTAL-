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
    <div className="min-h-screen flex flex-col bg-[#F6F5FA]">
      {/* Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E2EE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isFirstLogin ? (
              <button
                type="button"
                onClick={handleGoBack}
                className="btn-secondary h-8 px-2.5 text-xs"
                aria-label="Go Back to Portal"
              >
                <ChevronLeft className="w-4 h-4 text-[#35118F] -ml-0.5" />
                <span>Go Back</span>
              </button>
            ) : (
              <span className="badge-warning">
                First Login Setup
              </span>
            )}
          </div>

          <div className="text-center font-semibold text-[#24212D] text-sm tracking-tight">
            Account & Security
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-block font-mono bg-[#F6F5FA] border border-[#E5E2EE] px-2 py-0.5 rounded text-[#24212D] font-medium text-xs">
                  {user.staffId}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="h-8 px-2.5 rounded-lg text-xs font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors flex items-center space-x-1.5"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : isFirstLogin ? (
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-medium text-red-600 hover:text-red-700"
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
      <main className="flex-1 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-12 max-w-md w-full mx-auto">
        {/* Card Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex bg-[#F4F0FD] text-[#35118F] p-3 rounded-xl border border-[#35118F]/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight text-[#24212D]">
            {isFirstLogin ? "Set Your Personal Password" : "Change Account Password"}
          </h1>
          <p className="mt-1 text-xs text-[#6A6577] max-w-sm mx-auto">
            {isFirstLogin
              ? "For security, you must update your temporary initial password before proceeding."
              : "Update your institutional credentials below to keep your account secure."}
          </p>
        </div>

        {/* Password Form Card */}
        <div className="mt-5 bg-white py-6 px-6 sm:px-8 shadow-xs border border-[#E5E2EE] rounded-xl">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2.5 text-red-800 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-[#EEFBF6] border border-[#12B98A]/30 rounded-lg flex items-start space-x-2.5 text-[#0C7A5B] text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#12B98A] shrink-0 mt-0.5" />
              <span>Password updated successfully! Redirecting to portal...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isFirstLogin && (
              <div>
                <label htmlFor="currentPassword" className="form-label">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="form-label">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 digit"
                className="form-input"
              />
              <p className="text-[11px] text-[#6A6577] mt-1">
                Must be at least 8 characters with at least one uppercase letter and one number.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="form-input"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading || success}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#F5B51B]" />
                    <span>Updating Password...</span>
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
                  className="btn-secondary w-full"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-[#6A6577]" />
                  <span>Cancel & Return to Portal</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Institutional Mobile Bottom Navigation Bar for Staff */}
      {!isFirstLogin && (!user || user.role === "STAFF") && (
        <nav
          aria-label="Staff Bottom Navigation"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 mobile-nav-bar transition-all"
        >
          <div className="grid grid-cols-4 items-center justify-around max-w-lg mx-auto h-14 px-2">
            <Link
              href="/staff"
              className="flex flex-col items-center justify-center py-1 px-1 transition-colors text-[#6A6577] hover:text-[#24212D]"
            >
              <Utensils className="w-5 h-5" />
              <span className="text-[11px] mt-0.5 tracking-tight font-normal text-[#6A6577]">
                Meals
              </span>
            </Link>

            <Link
              href="/staff/qr"
              className="flex flex-col items-center justify-center py-1 px-1 transition-colors text-[#6A6577] hover:text-[#24212D]"
            >
              <QrCode className="w-5 h-5" />
              <span className="text-[11px] mt-0.5 tracking-tight font-normal text-[#6A6577]">
                My QR
              </span>
            </Link>

            <Link
              href="/staff/history"
              className="flex flex-col items-center justify-center py-1 px-1 transition-colors text-[#6A6577] hover:text-[#24212D]"
            >
              <History className="w-5 h-5" />
              <span className="text-[11px] mt-0.5 tracking-tight font-normal text-[#6A6577]">
                History
              </span>
            </Link>

            <div className="flex flex-col items-center justify-center py-1 px-1 transition-colors text-[#35118F]">
              <User className="w-5 h-5" />
              <span className="text-[11px] mt-0.5 tracking-tight font-semibold text-[#35118F]">
                Account
              </span>
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