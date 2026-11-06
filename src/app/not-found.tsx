import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#F6F5FA]">
      <div className="bg-white p-8 max-w-md w-full rounded-xl border border-[#E5E2EE] text-center">
        <div className="w-12 h-12 bg-[#F4F0FD] text-[#35118F] rounded-lg flex items-center justify-center mx-auto mb-4 border border-[#35118F]/20">
          <FileQuestion className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-[#24212D]">Page Not Found</h2>
        <p className="text-xs text-[#6A6577] mt-2 leading-relaxed">
          The requested portal URL or page does not exist.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="btn-primary h-10 px-5 text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

