"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  UtensilsCrossed,
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
  CalendarCheck,
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

  const staffNavLinks = [
    { href: "/staff", label: "Meal Selection", icon: CalendarCheck },
    { href: "/staff/qr", label: "My QR Codes", icon: QrCode },
    { href: "/staff/history", label: "Meal History", icon: History },
  ];

  const adminNavLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/responses", label: "Responses Matrix", icon: ClipboardList },
    { href: "/admin/staff", label: "Staff Directory", icon: Users },
    { href: "/admin/reports", label: "Reports & Export", icon: FileSpreadsheet },
    { href: "/admin/audit", label: "Audit Logs", icon: ShieldCheck },
  ];

  const canteenNavLinks = [
    { href: "/canteen", label: "Counter Status", icon: LayoutDashboard },
    { href: "/canteen/scan", label: "Scan QR Code", icon: ScanLine },
  ];

  const currentNavLinks =
    user.role === "STAFF"
      ? staffNavLinks
      : user.role === "ADMIN"
      ? adminNavLinks
      : canteenNavLinks;

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP LEFT SIDEBAR                                    */}
      {/* ========================================================= */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-40 bg-white border-r border-[#E5E2EE]">
        {/* Top: Official DBI Logo */}
        <div className="p-5 border-b border-[#E5E2EE]">
          <Link href="/" className="flex flex-col gap-2.5 group">
            <div className="bg-white p-2 rounded-xl border border-[#E5E2EE] flex items-center justify-center">
              <Image
                src="/dbi-logo.jpg"
                alt="Digital Bridge International Logo"
                width={150}
                height={50}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>
            <div>
              <div className="font-semibold text-xs text-[#24212D] tracking-tight">
                Staff Food Management
              </div>
              <div className="text-[10px] text-[#6A6577] uppercase tracking-wider font-medium">
                Digital Bridge International
              </div>
            </div>
          </Link>
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#9D98A8]">
            {user.role === "STAFF"
              ? "Staff Navigation"
              : user.role === "ADMIN"
              ? "Administration"
              : "Canteen Operations"}
          </div>

          {currentNavLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-[#F4F0FD] text-[#35118F] font-semibold border-l-3 border-[#35118F]"
                    : "text-[#6A6577] hover:text-[#24212D] hover:bg-[#F6F5FA]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? "text-[#35118F]" : "text-[#6A6577]"
                  }`}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom: User Settings & Sign Out */}
        <div className="p-3 border-t border-[#E5E2EE] bg-[#FDFDFE] space-y-1">
          <Link
            href="/change-password"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              isActive("/change-password")
                ? "bg-[#F4F0FD] text-[#35118F] font-semibold"
                : "text-[#6A6577] hover:text-[#24212D] hover:bg-[#F6F5FA]"
            }`}
          >
            <KeyRound className="w-4 h-4 text-[#6A6577] shrink-0" />
            <span>Change Password</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 hover:text-red-800 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-600 shrink-0" />
            <span>Sign Out</span>
          </button>

          <div className="pt-2 px-3 text-[10px] text-[#9D98A8]">
            Timezone: Asia/Kolkata (IST)
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. TOP HEADER (Staff Profile Top-Right)                    */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E2EE] h-16 md:ml-64">
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile hamburger menu & page title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden btn-icon"
              aria-label="Open Navigation Sidebar"
            >
              <Menu className="w-5 h-5 text-[#24212D]" />
            </button>

            {/* Mobile Logo */}
            <div className="md:hidden flex items-center space-x-2">
              <Image
                src="/dbi-logo.jpg"
                alt="DBI Logo"
                width={80}
                height={26}
                className="h-6 w-auto object-contain"
                priority
              />
              <span className="font-semibold text-xs text-[#24212D]">DBI Portal</span>
            </div>

            {/* Desktop Portal breadcrumb / status */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-xs font-medium text-[#6A6577]">Digital Bridge International</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-[#24212D]">
                {user.role === "STAFF"
                  ? "Staff Portal"
                  : user.role === "ADMIN"
                  ? "Admin Console"
                  : "Canteen Operations"}
              </span>
            </div>
          </div>

          {/* Right: Staff Profile Information (Requirement 4) */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-xs sm:text-sm font-semibold text-[#24212D] leading-tight">
                {user.fullName}
              </div>
              <div className="text-[11px] text-[#6A6577] flex items-center justify-end space-x-1.5 mt-0.5">
                <span className="font-mono bg-[#F6F5FA] px-1.5 py-0.2 rounded text-[#35118F] font-semibold border border-[#E5E2EE]">
                  {user.staffId}
                </span>
                {user.department && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="hidden sm:inline font-medium text-[#6A6577]">
                      {user.department}
                    </span>
                  </>
                )}
                <span className="text-slate-300">•</span>
                <span
                  className={`uppercase tracking-wider font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                    user.role === "STAFF"
                      ? "text-[#35118F] bg-[#F4F0FD] border border-[#35118F]/20"
                      : user.role === "CANTEEN"
                      ? "text-[#0C7A5B] bg-[#EEFBF6] border border-[#12B98A]/30"
                      : "text-[#B88204] bg-[#FEF9ED] border border-[#F5B51B]/40"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-[#E5E2EE] hidden sm:block" />

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="btn-secondary h-8 px-2.5 text-xs text-red-700 hover:bg-red-50 hover:border-red-200 hidden sm:flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 3. MOBILE RESPONSIVE SIDEBAR DRAWER                       */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-[#24212D]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative flex flex-col w-72 max-w-xs bg-white h-full shadow-2xl z-10">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E5E2EE] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Image
                  src="/dbi-logo.jpg"
                  alt="DBI Logo"
                  width={110}
                  height={36}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="btn-icon"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5 text-[#24212D]" />
              </button>
            </div>

            {/* Profile snippet in drawer */}
            <div className="p-4 bg-[#F6F5FA] border-b border-[#E5E2EE]">
              <div className="font-semibold text-xs text-[#24212D]">{user.fullName}</div>
              <div className="text-[11px] text-[#6A6577] mt-0.5 flex items-center gap-1.5">
                <span className="font-mono font-semibold text-[#35118F]">{user.staffId}</span>
                {user.department && <span>• {user.department}</span>}
              </div>
            </div>

            {/* Nav links */}
            <div className="flex-1 p-3 space-y-1 overflow-y-auto">
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#9D98A8]">
                Navigation
              </div>
              {currentNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? "bg-[#F4F0FD] text-[#35118F] font-semibold"
                        : "text-[#6A6577] hover:text-[#24212D] hover:bg-[#F6F5FA]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? "text-[#35118F]" : "text-[#6A6577]"
                      }`}
                    />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-[#E5E2EE] bg-[#FDFDFE] space-y-1">
              <Link
                href="/change-password"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium text-[#6A6577] hover:bg-[#F6F5FA]"
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Change Password</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 text-red-600 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
