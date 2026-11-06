"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
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
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E2EE] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo / Brand */}
            <div className="flex items-center space-x-3 shrink-0">
              <Link href="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
                <div className="bg-white px-2 py-1 rounded-xl border border-[#E5E2EE] shadow-xs flex items-center justify-center shrink-0">
                  <Image
                    src="/dbi-logo.jpg"
                    alt="Digital Bridge International Logo"
                    width={110}
                    height={36}
                    className="h-7 sm:h-8 w-auto object-contain"
                    priority
                  />
                </div>
                <div>
                  <div className="font-extrabold text-[#24212D] tracking-tight text-sm sm:text-base leading-tight">
                    Staff Food Portal
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#6A6577] font-semibold hidden sm:block leading-none mt-0.5">
                    Digital Bridge International
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Segmented Nav */}
            <nav className="hidden md:flex items-center bg-[#F6F5FA] border border-[#E5E2EE] p-1 rounded-full space-x-1 shrink-0">
              {user.role === "STAFF" && (
                <>
                  <Link
                    href="/staff"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/staff")
                        ? "bg-[#35118F] text-white shadow-xs"
                        : "text-[#6A6577] hover:text-[#24212D] hover:bg-white"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Meal Selection</span>
                  </Link>
                  <Link
                    href="/staff/qr"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/staff/qr")
                        ? "bg-[#35118F] text-white shadow-xs"
                        : "text-[#6A6577] hover:text-[#24212D] hover:bg-white"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>My QR Codes</span>
                  </Link>
                  <Link
                    href="/staff/history"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/staff/history")
                        ? "bg-[#35118F] text-white shadow-xs"
                        : "text-[#6A6577] hover:text-[#24212D] hover:bg-white"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
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
                        ? "bg-[#35118F] text-white shadow-xs"
                        : "text-[#6A6577] hover:text-[#24212D] hover:bg-white"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/admin/responses"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/admin/responses")
                        ? "bg-[#35118F] text-white shadow-xs"
                        : "text-[#6A6577] hover:text-[#24212D] hover:bg-white"
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Responses</span>
                  </Link>
                  <Link
                    href="/admin/staff"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/admin/staff")
                        ? "bg-[#35118F] text-white shadow-xs"
                        : "text-[#6A6577] hover:text-[#24212D] hover:bg-white"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Staff Directory</span>
                  </Link>
                  <Link
                    href="/admin/reports"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/admin/reports")
                        ? "bg-[#35118F] text-white shadow-xs"
                        : "text-[#6A6577] hover:text-[#24212D] hover:bg-white"
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Reports</span>
                  </Link>
                  <Link
                    href="/admin/audit"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/admin/audit")
                        ? "bg-[#35118F] text-white shadow-xs"
                        : "text-[#6A6577] hover:text-[#24212D] hover:bg-white"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
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
                        ? "bg-[#35118F] text-white shadow-xs"
                        : "text-[#6A6577] hover:text-[#24212D] hover:bg-white"
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Canteen Counts</span>
                  </Link>
                  <Link
                    href="/canteen/scan"
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive("/canteen/scan")
                        ? "bg-[#12B98A] text-white shadow-xs font-bold"
                        : "text-[#12B98A] bg-[#EEFBF6] hover:bg-[#D2F6EA]"
                    }`}
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    <span>Scan QR</span>
                  </Link>
                </>
              )}
            </nav>

            {/* User Profile & Actions */}
            <div className="flex items-center space-x-2.5 shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-[#24212D] leading-tight">{user.fullName}</div>
                <div className="text-[10px] text-[#6A6577] flex items-center justify-end space-x-1.5 mt-0.5">
                  <span className="font-mono bg-[#F6F5FA] px-1.5 py-0.5 rounded-md text-[#24212D] font-semibold border border-[#E5E2EE]">
                    {user.staffId}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span
                    className={`uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md text-[9px] ${
                      user.role === "CANTEEN"
                        ? "text-[#12B98A] bg-[#EEFBF6] border border-[#D2F6EA]"
                        : "text-[#35118F] bg-[#F4F0FD] border border-[#E9E1FA]"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Mobile Staff ID Badge */}
              <div className="sm:hidden font-mono bg-[#F6F5FA] border border-[#E5E2EE] px-2 py-1 rounded-xl text-[#24212D] font-extrabold text-xs shadow-xs">
                {user.staffId}
              </div>

              <div className="h-6 w-px bg-[#E5E2EE] hidden sm:block" />

              <Link
                href="/change-password"
                title="Change Password"
                className="p-2 text-[#6A6577] hover:text-[#35118F] hover:bg-[#F4F0FD] rounded-xl transition hidden md:block"
              >
                <KeyRound className="w-4 h-4" />
              </Link>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition flex items-center space-x-1.5 text-xs font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile Hamburger Button for Admin & Canteen only */}
              {user.role !== "STAFF" && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-[#24212D] hover:bg-[#F6F5FA] rounded-xl transition"
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
          <div className="md:hidden border-t border-[#E5E2EE] bg-white px-4 py-3 space-y-1.5 shadow-lg">
            {user.role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive("/admin")
                      ? "bg-[#35118F] text-white shadow-xs"
                      : "text-[#24212D] hover:bg-[#F6F5FA]"
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
                      ? "bg-[#35118F] text-white shadow-xs"
                      : "text-[#24212D] hover:bg-[#F6F5FA]"
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
                      ? "bg-[#35118F] text-white shadow-xs"
                      : "text-[#24212D] hover:bg-[#F6F5FA]"
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
                      ? "bg-[#35118F] text-white shadow-xs"
                      : "text-[#24212D] hover:bg-[#F6F5FA]"
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
                      ? "bg-[#35118F] text-white shadow-xs"
                      : "text-[#24212D] hover:bg-[#F6F5FA]"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Audit Logs</span>
                </Link>
                <div className="pt-2 border-t border-[#E5E2EE] mt-1">
                  <Link
                    href="/change-password"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#24212D] hover:bg-[#F6F5FA] transition"
                  >
                    <KeyRound className="w-4 h-4 text-[#6A6577]" />
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
                      ? "bg-[#35118F] text-white shadow-xs"
                      : "text-[#24212D] hover:bg-[#F6F5FA]"
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
                      ? "bg-[#12B98A] text-white shadow-xs font-bold"
                      : "text-[#12B98A] bg-[#EEFBF6] hover:bg-[#D2F6EA]"
                  }`}
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Scan QR Code</span>
                </Link>
                <div className="pt-2 border-t border-[#E5E2EE] mt-1">
                  <Link
                    href="/change-password"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#24212D] hover:bg-[#F6F5FA] transition"
                  >
                    <KeyRound className="w-4 h-4 text-[#6A6577]" />
                    <span>Change Password</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* Floating Capsule Dock for Staff Mobile */}
      {user.role === "STAFF" && (
        <nav
          aria-label="Staff Floating Navigation"
          className="md:hidden fixed bottom-5 left-4 right-4 sm:left-6 sm:right-6 max-w-[340px] sm:max-w-[360px] mx-auto z-50 dbi-capsule-dock p-1.5 transition-all"
        >
          <div className="grid grid-cols-4 items-center justify-between gap-1">
            {/* Meals */}
            <Link
              href="/staff"
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-[20px] transition-all active:scale-95 ${
                isActive("/staff")
                  ? "dbi-tab-active"
                  : "text-[#24212D] hover:text-[#35118F]"
              }`}
            >
              <Utensils
                className={`w-[20px] h-[20px] ${
                  isActive("/staff") ? "text-[#35118F] stroke-[2.3]" : "text-[#24212D] stroke-[2]"
                }`}
              />
              <span
                className={`text-[11px] mt-1 tracking-tight leading-none ${
                  isActive("/staff") ? "font-bold text-[#35118F]" : "font-semibold text-[#24212D]"
                }`}
              >
                Meals
              </span>
              {isActive("/staff") ? (
                <div className="dbi-dash-indicator mt-1" />
              ) : (
                <div className="w-[16px] h-[3px] mt-1 opacity-0 pointer-events-none" />
              )}
            </Link>

            {/* My QR */}
            <Link
              href="/staff/qr"
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-[20px] transition-all active:scale-95 ${
                isActive("/staff/qr")
                  ? "dbi-tab-active"
                  : "text-[#24212D] hover:text-[#35118F]"
              }`}
            >
              <QrCode
                className={`w-[20px] h-[20px] ${
                  isActive("/staff/qr") ? "text-[#35118F] stroke-[2.3]" : "text-[#24212D] stroke-[2]"
                }`}
              />
              <span
                className={`text-[11px] mt-1 tracking-tight leading-none ${
                  isActive("/staff/qr") ? "font-bold text-[#35118F]" : "font-semibold text-[#24212D]"
                }`}
              >
                My QR
              </span>
              {isActive("/staff/qr") ? (
                <div className="dbi-dash-indicator mt-1" />
              ) : (
                <div className="w-[16px] h-[3px] mt-1 opacity-0 pointer-events-none" />
              )}
            </Link>

            {/* History */}
            <Link
              href="/staff/history"
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-[20px] transition-all active:scale-95 ${
                isActive("/staff/history")
                  ? "dbi-tab-active"
                  : "text-[#24212D] hover:text-[#35118F]"
              }`}
            >
              <History
                className={`w-[20px] h-[20px] ${
                  isActive("/staff/history") ? "text-[#35118F] stroke-[2.3]" : "text-[#24212D] stroke-[2]"
                }`}
              />
              <span
                className={`text-[11px] mt-1 tracking-tight leading-none ${
                  isActive("/staff/history") ? "font-bold text-[#35118F]" : "font-semibold text-[#24212D]"
                }`}
              >
                History
              </span>
              {isActive("/staff/history") ? (
                <div className="dbi-dash-indicator mt-1" />
              ) : (
                <div className="w-[16px] h-[3px] mt-1 opacity-0 pointer-events-none" />
              )}
            </Link>

            {/* Account */}
            <Link
              href="/change-password"
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-[20px] transition-all active:scale-95 ${
                isActive("/change-password")
                  ? "dbi-tab-active"
                  : "text-[#24212D] hover:text-[#35118F]"
              }`}
            >
              <User
                className={`w-[20px] h-[20px] ${
                  isActive("/change-password") ? "text-[#35118F] stroke-[2.3]" : "text-[#24212D] stroke-[2]"
                }`}
              />
              <span
                className={`text-[11px] mt-1 tracking-tight leading-none ${
                  isActive("/change-password") ? "font-bold text-[#35118F]" : "font-semibold text-[#24212D]"
                }`}
              >
                Account
              </span>
              {isActive("/change-password") ? (
                <div className="dbi-dash-indicator mt-1" />
              ) : (
                <div className="w-[16px] h-[3px] mt-1 opacity-0 pointer-events-none" />
              )}
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
