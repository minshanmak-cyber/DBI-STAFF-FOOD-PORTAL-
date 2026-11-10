"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  ChevronDown,
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Click-outside listener for user profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenuOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading || !user) return null;

  const isActive = (path: string) => pathname === path;
  const roleLabel =
    user.role === "ADMIN"
      ? "Administrator"
      : user.role === "CANTEEN"
      ? "Canteen"
      : "Staff";

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E2EE] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo / Brand */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex items-center space-x-3 sm:space-x-3.5 group py-1">
                <Image
                  src="/dbi-logo.jpg"
                  alt="Digital Bridge International"
                  width={130}
                  height={40}
                  className="h-8 sm:h-9 w-auto object-contain shrink-0"
                  priority
                />
                <div className="h-8 w-px bg-[#E5E2EE] shrink-0" />
                <div className="flex flex-col justify-center">
                  <div className="font-bold text-[#1A162B] text-sm sm:text-base leading-tight tracking-tight">
                    Staff Food Portal
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#555062] font-normal leading-tight mt-0.5">
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
            <div className="flex items-center space-x-2 shrink-0">
              {/* Profile Chip & Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg border border-transparent hover:border-[#E5E2EE] hover:bg-[#F6F5FA] transition-all text-left group focus:outline-hidden focus:ring-2 focus:ring-[#35118F]/20"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="User account menu"
                >
                  {/* Initials Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#35118F]/10 text-[#35118F] border border-[#35118F]/15 flex items-center justify-center text-xs font-semibold shrink-0 select-none group-hover:bg-[#35118F] group-hover:text-white transition-colors">
                    {getInitials(user.fullName)}
                  </div>

                  {/* Desktop / Tablet User Identity */}
                  <div className="hidden sm:block text-left leading-tight">
                    <div className="text-xs font-semibold text-[#24212D] truncate max-w-[130px]">
                      {user.fullName}
                    </div>
                    <div className="text-[11px] text-[#6A6577] flex items-center gap-1 mt-0.5 font-normal">
                      <span className="font-mono text-[#4A4557] font-medium">{user.staffId}</span>
                      <span className="text-[#C5C0D0]">·</span>
                      <span>{roleLabel}</span>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#6A6577] transition-transform duration-200 hidden sm:block ${
                      userMenuOpen ? "rotate-180 text-[#35118F]" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Card */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white border border-[#E5E2EE] shadow-lg py-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                    <div className="px-3.5 py-2.5 border-b border-[#E5E2EE] bg-[#FDFCFE]">
                      <div className="text-xs font-semibold text-[#24212D] truncate">
                        {user.fullName}
                      </div>
                      <div className="text-[11px] text-[#6A6577] mt-1 flex items-center justify-between">
                        <span className="font-mono text-[#24212D] font-medium">{user.staffId}</span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                            user.role === "CANTEEN"
                              ? "bg-[#EEFBF6] text-[#0C7A5B] border border-[#D2F6EA]"
                              : "bg-[#F4F0FD] text-[#35118F] border border-[#E9E1FA]"
                          }`}
                        >
                          {roleLabel}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/change-password"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#24212D] hover:bg-[#F6F5FA] hover:text-[#35118F] transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-[#6A6577]" />
                        <span>Change Password</span>
                      </Link>
                    </div>

                    <div className="border-t border-[#E5E2EE] pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Sign Out Button */}
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-[#6A6577] bg-white border border-[#E5E2EE] hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors hidden sm:flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
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
