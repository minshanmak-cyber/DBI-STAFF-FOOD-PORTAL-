"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle2,
  Loader2,
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
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F6F5FA]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Official DBI Logo */}
        <div className="flex justify-center mb-5">
          <Image
            src="/dbi-logo.jpg"
            alt="Digital Bridge International"
            width={240}
            height={70}
            className="h-12 sm:h-14 w-auto object-contain"
            priority
          />
        </div>

        <h1 className="text-center text-2xl font-semibold tracking-tight text-[#24212D]">
          {isFirstLogin ? "Set Your Personal Password" : "Change Account Password"}
        </h1>
        <p className="mt-1 text-center text-xs text-[#6A6577] max-w-sm mx-auto">
          {isFirstLogin
            ? "For security, you must update your temporary initial password before proceeding."
            : "Update your institutional credentials below to keep your account secure."}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 sm:px-8 shadow-xs border border-[#E5E2EE] rounded-xl">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2.5 text-red-800 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-[#EEFBF6] border border-[#12B98A]/30 rounded-lg flex items-start space-x-2.5 text-[#0C7A5B] text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#12B98A] shrink-0 mt-0.5" />
              <span>Password updated successfully! Redirecting...</span>
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
                placeholder="Enter new password"
                className="form-input"
              />
              <p className="text-[12px] text-[#6A6577] mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#35118F]/60 shrink-0" />
                <span>Minimum 8 characters with at least one uppercase letter and one number</span>
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
                placeholder="Re-enter new password"
                className="form-input"
              />
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={loading || success}
                className="btn-primary w-full justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#F5B51B]" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Confirm & Update Password</span>
                )}
              </button>

              {!isFirstLogin ? (
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="btn-secondary w-full justify-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1 text-[#6A6577]" />
                  <span>Cancel & Return to Portal</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-center text-xs font-medium text-[#6A6577] hover:text-red-700 pt-2 transition-colors"
                >
                  Cancel & Sign Out
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F6F5FA]">
          <Loader2 className="w-8 h-8 animate-spin text-[#35118F]" />
        </div>
      }
    >
      <ChangePasswordContent />
    </Suspense>
  );
}
