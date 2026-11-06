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
            <nav className="hidden md:flex items-center bg-[#F6F5FA] border border-[#E5E2EE] p-1 rounded-lg space-x-1 shrink-0">
              {user.role === "STAFF" && (
                <>
                  <Link
                    href="/staff"
                    className={`h-8 px-3 rounded-md text-xs font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
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
                    className={`h-8 px-3 rounded-md text-xs font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
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
                    className={`h-8 px-3 rounded-md text-xs font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
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
                    className={`h-8 px-3 rounded-md text-xs font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
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
                    className={`h-8 px-3 rounded-md text-xs font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
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
                    className={`h-8 px-3 rounded-md text-xs font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
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
                    className={`h-8 px-3 rounded-md text-xs font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
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
                    className={`h-8 px-3 rounded-md text-xs font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
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
                    className={`h-8 px-3 rounded-md text-xs font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
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
                    className={`h-8 px-3 rounded-md text-xs font-medium flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
                      isActive("/canteen/scan")
                        ? "bg-[#12B98A] text-white shadow-xs"
                        : "text-[#0C7A5B] bg-[#EEFBF6] hover:bg-[#D2F6EA]"
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
              <div className="sm:hidden font-mono bg-[#F6F5FA] border border-[#E5E2EE] px-2 py-1 rounded-md text-[#24212D] font-semibold text-xs">
                {user.staffId}
              </div>

              <div className="h-5 w-px bg-[#E5E2EE] hidden sm:block" />

              <Link
                href="/change-password"
                title="Change Password"
                className="btn-icon hidden md:inline-flex"
              >
                <KeyRound className="w-4 h-4" />
              </Link>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>

              {/* Mobile Hamburger Button for Admin & Canteen only */}
              {user.role !== "STAFF" && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden btn-icon"
                  aria-label="Toggle Navigation Menu"
                >
                  {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
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

      {/* Institutional Mobile Bottom Navigation Bar for Staff */}
      {user.role === "STAFF" && (
        <nav
          aria-label="Staff Bottom Navigation"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 mobile-nav-bar transition-all"
        >
          <div className="grid grid-cols-4 items-center justify-around max-w-lg mx-auto h-14 px-2">
            {/* Meals */}
            <Link
              href="/staff"
              className={`flex flex-col items-center justify-center py-1 px-1 transition-colors ${
                isActive("/staff")
                  ? "text-[#35118F]"
                  : "text-[#6A6577] hover:text-[#24212D]"
              }`}
            >
              <Utensils className="w-5 h-5" />
              <span
                className={`text-[11px] mt-0.5 tracking-tight ${
                  isActive("/staff") ? "font-semibold text-[#35118F]" : "font-normal text-[#6A6577]"
                }`}
              >
                Meals
              </span>
            </Link>

            {/* My QR */}
            <Link
              href="/staff/qr"
              className={`flex flex-col items-center justify-center py-1 px-1 transition-colors ${
                isActive("/staff/qr")
                  ? "text-[#35118F]"
                  : "text-[#6A6577] hover:text-[#24212D]"
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span
                className={`text-[11px] mt-0.5 tracking-tight ${
                  isActive("/staff/qr") ? "font-semibold text-[#35118F]" : "font-normal text-[#6A6577]"
                }`}
              >
                My QR
              </span>
            </Link>

            {/* History */}
            <Link
              href="/staff/history"
              className={`flex flex-col items-center justify-center py-1 px-1 transition-colors ${
                isActive("/staff/history")
                  ? "text-[#35118F]"
                  : "text-[#6A6577] hover:text-[#24212D]"
              }`}
            >
              <History className="w-5 h-5" />
              <span
                className={`text-[11px] mt-0.5 tracking-tight ${
                  isActive("/staff/history") ? "font-semibold text-[#35118F]" : "font-normal text-[#6A6577]"
                }`}
              >
                History
              </span>
            </Link>

            {/* Account */}
            <Link
              href="/change-password"
              className={`flex flex-col items-center justify-center py-1 px-1 transition-colors ${
                isActive("/change-password")
                  ? "text-[#35118F]"
                  : "text-[#6A6577] hover:text-[#24212D]"
              }`}
            >
              <User className="w-5 h-5" />
              <span
                className={`text-[11px] mt-0.5 tracking-tight ${
                  isActive("/change-password") ? "font-semibold text-[#35118F]" : "font-normal text-[#6A6577]"
                }`}
              >
                Account
              </span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
