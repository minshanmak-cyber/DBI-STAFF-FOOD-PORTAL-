import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#F6F5FA]">
      <div className="bg-white p-8 max-w-md w-full rounded-2xl border border-[#E5E2EE] shadow-xs text-center">
        <div className="w-12 h-12 bg-[#F4F0FD] text-[#35118F] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#35118F]/20">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#24212D]">Page Not Found</h2>
        <p className="text-sm text-[#6A6577] mt-2">
          The requested portal URL or page does not exist.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#35118F] hover:bg-[#2a0d72] text-white text-sm font-semibold rounded-xl shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#F5B51B]" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

