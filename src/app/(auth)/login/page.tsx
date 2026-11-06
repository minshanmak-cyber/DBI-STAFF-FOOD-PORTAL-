"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: staffId.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      // Success
      router.push(data.redirectTo || "/staff");
      router.refresh();
    } catch (err) {
      setError("Network error. Could not connect to the authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F6F5FA]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Official DBI Logo */}
        <div className="flex justify-center mb-4">
          <div className="bg-white px-5 py-3 rounded-2xl border border-[#E5E2EE] shadow-xs inline-flex items-center justify-center">
            <Image
              src="/dbi-logo.jpg"
              alt="Digital Bridge International Logo"
              width={260}
              height={80}
              className="h-14 sm:h-16 w-auto object-contain"
              priority
            />
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold tracking-tight text-[#24212D]">
          Staff Food Management Portal
        </h2>
        <p className="mt-1 text-center text-xs text-[#6A6577] font-medium">
          Sign in using your assigned institutional Staff ID
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xs border border-[#E5E2EE] rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="staffId"
                className="block text-xs font-semibold uppercase tracking-wider text-[#24212D]"
              >
                Staff ID
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6A6577]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="staffId"
                  name="staffId"
                  type="text"
                  required
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  placeholder="e.g. 1001 or ADMIN001"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-[#E5E2EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35118F] focus:border-[#35118F] uppercase font-mono tracking-wide text-[#24212D] bg-[#F6F5FA]/40 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#24212D]"
              >
                Password
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6A6577]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm border border-[#E5E2EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35118F] focus:border-[#35118F] text-[#24212D] bg-[#F6F5FA]/40 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl shadow-xs text-sm font-semibold text-white bg-[#35118F] hover:bg-[#2a0d72] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#35118F] transition active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#F5B51B]" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

