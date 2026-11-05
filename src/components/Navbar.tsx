"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  UtensilsCrossed,
  Utensils,
  LogOut,
  QrCode,
  History,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  ClipboardList,
  ScanLine,
  LayoutDashboard,
  KeyRound,
  User,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

interface UserProfile {
  id: string;
  staffId: string;
  role: "ADMIN" | "STAFF" | "CANTEEN";
  fullName: string;
  department?: string | null;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unauthenticated");
      })
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  if (loading || !user) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Top Header with Liquid Glass Finish */}
      <header className="sticky top-0 z-40 liquid-glass border-b border-white/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo / Brand */}
            <div className="flex items-center space-x-3 shrink-0">
              <Link href="/" className="flex items-center space-x-2.5 group">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-sky-400 p-2.5 rounded-2xl flex items-center justify-center shadow-[0_4px_14px_rgba(15,23,42,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-200">
                  <UtensilsCrossed className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg leading-tight flex items-center gap-1.5">
                    <span>DBI Staff Food Portal</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold hidden sm:block leading-none mt-0.5">
                    Institutional Food Operations
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Segmented Floating Liquid Nav */}
            <nav className="hidden md:flex items-center liquid-glass-subtle p-1.5 rounded-full space-x-1 shrink-0">
              {user.role === "STAFF" && (
                <>
                  <Link
                    href="/staff"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/staff")
                        ? "bg-white/95 text-sky-950 shadow-[0_3px_10px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] scale-[1.02]"
                        : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                    }`}
                  >
                    <LayoutDashboard className={`w-3.5 h-3.5 ${isActive("/staff") ? "text-sky-600" : "text-slate-500"}`} />
                    <span>Meal Selection</span>
                  </Link>
                  <Link
                    href="/staff/qr"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/staff/qr")
                        ? "bg-white/95 text-sky-950 shadow-[0_3px_10px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] scale-[1.02]"
                        : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                    }`}
                  >
                    <QrCode className={`w-3.5 h-3.5 ${isActive("/staff/qr") ? "text-sky-600" : "text-slate-500"}`} />
                    <span>My QR Codes</span>
                  </Link>
                  <Link
                    href="/staff/history"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/staff/history")
                        ? "bg-white/95 text-sky-950 shadow-[0_3px_10px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] scale-[1.02]"
                        : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                    }`}
                  >
                    <History className={`w-3.5 h-3.5 ${isActive("/staff/history") ? "text-sky-600" : "text-slate-500"}`} />
                    <span>History</span>
                  </Link>
                </>
              )}

              {user.role === "ADMIN" && (
                <>
                  <Link
                    href="/admin"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/admin")
                        ? "bg-white/95 text-slate-950 shadow-[0_3px_10px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] scale-[1.02]"
                        : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                    }`}
                  >
                    <LayoutDashboard className={`w-3.5 h-3.5 ${isActive("/admin") ? "text-sky-600" : "text-slate-500"}`} />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/admin/responses"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/admin/responses")
                        ? "bg-white/95 text-slate-950 shadow-[0_3px_10px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] scale-[1.02]"
                        : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                    }`}
                  >
                    <ClipboardList className={`w-3.5 h-3.5 ${isActive("/admin/responses") ? "text-sky-600" : "text-slate-500"}`} />
                    <span>Responses</span>
                  </Link>
                  <Link
                    href="/admin/staff"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/admin/staff")
                        ? "bg-white/95 text-slate-950 shadow-[0_3px_10px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] scale-[1.02]"
                        : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                    }`}
                  >
                    <Users className={`w-3.5 h-3.5 ${isActive("/admin/staff") ? "text-sky-600" : "text-slate-500"}`} />
                    <span>Staff Directory</span>
                  </Link>
                  <Link
                    href="/admin/reports"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/admin/reports")
                        ? "bg-white/95 text-slate-950 shadow-[0_3px_10px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] scale-[1.02]"
                        : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                    }`}
                  >
                    <FileSpreadsheet className={`w-3.5 h-3.5 ${isActive("/admin/reports") ? "text-sky-600" : "text-slate-500"}`} />
                    <span>Reports</span>
                  </Link>
                  <Link
                    href="/admin/audit"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/admin/audit")
                        ? "bg-white/95 text-slate-950 shadow-[0_3px_10px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] scale-[1.02]"
                        : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                    }`}
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 ${isActive("/admin/audit") ? "text-sky-600" : "text-slate-500"}`} />
                    <span>Audit Logs</span>
                  </Link>
                </>
              )}

              {user.role === "CANTEEN" && (
                <>
                  <Link
                    href="/canteen"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/canteen")
                        ? "bg-white/95 text-slate-950 shadow-[0_3px_10px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,1)] scale-[1.02]"
                        : "text-slate-600 hover:text-slate-950 hover:bg-white/60"
                    }`}
                  >
                    <LayoutDashboard className={`w-3.5 h-3.5 ${isActive("/canteen") ? "text-sky-600" : "text-slate-500"}`} />
                    <span>Canteen Counts</span>
                  </Link>
                  <Link
                    href="/canteen/scan"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/canteen/scan")
                        ? "bg-slate-900 text-white shadow-[0_4px_14px_rgba(15,23,42,0.3)] scale-[1.02]"
                        : "bg-sky-50/80 text-sky-800 hover:bg-sky-100"
                    }`}
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    <span>Scan QR</span>
                  </Link>
                </>
              )}
            </nav>

            {/* User Profile & Actions with Liquid Glass Accents */}
            <div className="flex items-center space-x-2.5 shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{user.fullName}</div>
                <div className="text-[10px] text-slate-500 flex items-center justify-end space-x-1.5 mt-0.5">
                  <span className="font-mono bg-slate-100/80 px-1.5 py-0.5 rounded-md text-slate-700 font-semibold border border-slate-200/50">
                    {user.staffId}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="uppercase tracking-wider font-extrabold text-sky-800 bg-sky-50/80 border border-sky-200/60 px-1.5 py-0.5 rounded-md text-[9px] shadow-[0_1px_4px_rgba(56,189,248,0.15)]">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Mobile Staff ID Badge */}
              <div className="sm:hidden font-mono bg-slate-100/90 border border-slate-200/60 px-2 py-1 rounded-xl text-slate-800 font-extrabold text-xs shadow-xs">
                {user.staffId}
              </div>

              <div className="h-6 w-px bg-slate-200/80 hidden sm:block" />

              <Link
                href="/change-password"
                title="Change Password"
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all duration-200 hidden md:block"
              >
                <KeyRound className="w-4 h-4" />
              </Link>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50/80 border border-transparent hover:border-rose-100 rounded-xl transition-all duration-200 flex items-center space-x-1.5 text-xs font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile Hamburger Button for Admin & Canteen only */}
              {user.role !== "STAFF" && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-slate-600 hover:bg-slate-100/80 rounded-xl transition"
                  aria-label="Toggle Navigation Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown for Admin & Canteen */}
        {mobileMenuOpen && user.role !== "STAFF" && (
          <div className="md:hidden border-t border-white/60 liquid-glass px-4 py-3 space-y-1.5 shadow-xl">
            {user.role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive("/admin")
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-700 hover:bg-white/60"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/admin/responses"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive("/admin/responses")
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-700 hover:bg-white/60"
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Responses</span>
                </Link>
                <Link
                  href="/admin/staff"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive("/admin/staff")
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Staff Directory</span>
                </Link>
                <Link
                  href="/admin/reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive("/admin/reports")
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Reports</span>
                </Link>
                <Link
                  href="/admin/audit"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive("/admin/audit")
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Audit Logs</span>
                </Link>
                <div className="pt-2 border-t border-slate-200/60 mt-1">
                  <Link
                    href="/change-password"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    <span>Change Password</span>
                  </Link>
                </div>
              </>
            )}

            {user.role === "CANTEEN" && (
              <>
                <Link
                  href="/canteen"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive("/canteen")
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-700 hover:bg-white/60"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Canteen Counts</span>
                </Link>
                <Link
                  href="/canteen/scan"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive("/canteen/scan")
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-700 hover:bg-white/60"
                  }`}
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Scan QR Code</span>
                </Link>
                <div className="pt-2 border-t border-slate-200/60 mt-1">
                  <Link
                    href="/change-password"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white/60 transition"
                  >
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    <span>Change Password</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* iOS 27 Liquid Glass Floating Capsule Dock for Staff */}
      {user.role === "STAFF" && (
        <nav
          aria-label="Staff Floating Liquid Navigation"
          className="md:hidden fixed bottom-5 left-4 right-4 sm:left-6 sm:right-6 max-w-[340px] sm:max-w-[360px] mx-auto z-50 liquid-capsule-dock p-1.5 transition-all duration-300"
        >
          <div className="grid grid-cols-4 items-center justify-between gap-1">
            {/* Meals */}
            <Link
              href="/staff"
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-[22px] transition-all duration-200 active:scale-95 ${
                isActive("/staff")
                  ? "liquid-tab-active"
                  : "text-slate-800 hover:text-slate-950"
              }`}
            >
              <Utensils
                className={`w-[22px] h-[22px] ${
                  isActive("/staff") ? "text-[#0284c7] stroke-[2.3]" : "text-slate-800 stroke-[2]"
                }`}
              />
              <span
                className={`text-[11px] mt-1 tracking-tight leading-none ${
                  isActive("/staff") ? "font-bold text-[#0284c7]" : "font-semibold text-slate-800"
                }`}
              >
                Meals
              </span>
              {isActive("/staff") ? (
                <div className="liquid-dash-indicator mt-1" />
              ) : (
                <div className="w-[14px] h-[4px] mt-1 opacity-0 pointer-events-none" />
              )}
            </Link>

            {/* My QR */}
            <Link
              href="/staff/qr"
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-[22px] transition-all duration-200 active:scale-95 ${
                isActive("/staff/qr")
                  ? "liquid-tab-active"
                  : "text-slate-800 hover:text-slate-950"
              }`}
            >
              <QrCode
                className={`w-[22px] h-[22px] ${
                  isActive("/staff/qr") ? "text-[#0284c7] stroke-[2.3]" : "text-slate-800 stroke-[2]"
                }`}
              />
              <span
                className={`text-[11px] mt-1 tracking-tight leading-none ${
                  isActive("/staff/qr") ? "font-bold text-[#0284c7]" : "font-semibold text-slate-800"
                }`}
              >
                My QR
              </span>
              {isActive("/staff/qr") ? (
                <div className="liquid-dash-indicator mt-1" />
              ) : (
                <div className="w-[14px] h-[4px] mt-1 opacity-0 pointer-events-none" />
              )}
            </Link>

            {/* History */}
            <Link
              href="/staff/history"
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-[22px] transition-all duration-200 active:scale-95 ${
                isActive("/staff/history")
                  ? "liquid-tab-active"
                  : "text-slate-800 hover:text-slate-950"
              }`}
            >
              <History
                className={`w-[22px] h-[22px] ${
                  isActive("/staff/history") ? "text-[#0284c7] stroke-[2.3]" : "text-slate-800 stroke-[2]"
                }`}
              />
              <span
                className={`text-[11px] mt-1 tracking-tight leading-none ${
                  isActive("/staff/history") ? "font-bold text-[#0284c7]" : "font-semibold text-slate-800"
                }`}
              >
                History
              </span>
              {isActive("/staff/history") ? (
                <div className="liquid-dash-indicator mt-1" />
              ) : (
                <div className="w-[14px] h-[4px] mt-1 opacity-0 pointer-events-none" />
              )}
            </Link>

            {/* Account */}
            <Link
              href="/change-password"
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-[22px] transition-all duration-200 active:scale-95 ${
                isActive("/change-password")
                  ? "liquid-tab-active"
                  : "text-slate-800 hover:text-slate-950"
              }`}
            >
              <User
                className={`w-[22px] h-[22px] ${
                  isActive("/change-password") ? "text-[#0284c7] stroke-[2.3]" : "text-slate-800 stroke-[2]"
                }`}
              />
              <span
                className={`text-[11px] mt-1 tracking-tight leading-none ${
                  isActive("/change-password") ? "font-bold text-[#0284c7]" : "font-semibold text-slate-800"
                }`}
              >
                Account
              </span>
              {isActive("/change-password") ? (
                <div className="liquid-dash-indicator mt-1" />
              ) : (
                <div className="w-[14px] h-[4px] mt-1 opacity-0 pointer-events-none" />
              )}
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
