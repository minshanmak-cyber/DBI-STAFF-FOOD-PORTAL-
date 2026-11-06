import Link from "next/link";
import { ShieldX, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#F6F5FA]">
      <div className="bg-white p-8 max-w-md w-full rounded-xl border border-[#E5E2EE] text-center">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <ShieldX className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-[#24212D]">Access Restricted</h2>
        <p className="text-xs text-[#6A6577] mt-2 leading-relaxed">
          You do not have administrative or operator clearance to access this section of the portal.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="btn-primary h-10 px-5 text-xs font-medium"
          >
            <Home className="w-4 h-4" />
            <span>Return to Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

