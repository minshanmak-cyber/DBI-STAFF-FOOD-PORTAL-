"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Utensils,
  User,
  Clock,
} from "lucide-react";
import QrScannerComponent from "@/components/QrScannerComponent";

interface VerificationResult {
  status:
    | "SUCCESS"
    | "ALREADY_COLLECTED"
    | "INELIGIBLE"
    | "INVALID_TOKEN"
    | "EXPIRED"
    | "STAFF_INACTIVE"
    | "ERROR";
  success: boolean;
  message: string;
  data?: {
    staffId: string;
    staffName: string;
    department?: string | null;
    mealType: string;
    serviceDate: string;
    collectedAt?: string;
    previouslyCollectedAt?: string;
  };
}

export default function CanteenScanPage() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleScan = async (scannedToken: string) => {
    if (processing) return;
    setProcessing(true);

    try {
      const res = await fetch("/api/canteen/verify-collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrToken: scannedToken }),
      });

      const json = await res.json();
      setResult(json);
    } catch (err) {
      setResult({
        status: "ERROR",
        success: false,
        message: "Failed to communicate with verification server.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Link
          href="/canteen"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#6A6577] hover:text-[#35118F] mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Canteen Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-[#24212D]">Meal Collection Verification</h1>
        <p className="text-xs text-[#6A6577] mt-1">
          Scan the staff member's QR code. Database locks prevent duplicate meal redemptions.
        </p>
      </div>

      {/* Verification Result Display */}
      {result && (
        <div
          className={`rounded-2xl p-6 border shadow-xs transition ${
            result.status === "SUCCESS"
              ? "bg-[#EEFBF6] border-[#12B98A]/40 text-[#0C7A5B]"
              : result.status === "ALREADY_COLLECTED"
              ? "bg-rose-50 border-rose-300 text-rose-950"
              : result.status === "INELIGIBLE"
              ? "bg-[#FEF9ED] border-[#F5B51B]/40 text-[#B88204]"
              : "bg-red-50 border-red-300 text-red-950"
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="p-2.5 rounded-xl bg-white/90 shadow-xs border border-[#E5E2EE]">
              {result.status === "SUCCESS" ? (
                <CheckCircle2 className="w-8 h-8 text-[#12B98A]" />
              ) : result.status === "ALREADY_COLLECTED" ? (
                <XCircle className="w-8 h-8 text-rose-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-[#F5B51B]" />
              )}
            </div>

            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider block">
                {result.status === "SUCCESS"
                  ? "COLLECTION APPROVED"
                  : result.status === "ALREADY_COLLECTED"
                  ? "DUPLICATE COLLECTION DENIED"
                  : result.status === "INELIGIBLE"
                  ? "STAFF NOT ELIGIBLE"
                  : "VERIFICATION FAILED"}
              </span>
              <h2 className="text-lg font-bold mt-0.5">{result.message}</h2>

              {result.data && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-[#E5E2EE] text-xs text-[#24212D] space-y-1.5 font-sans">
                  <div className="flex justify-between">
                    <span className="text-[#6A6577]">Staff Member:</span>
                    <span className="font-bold text-[#24212D]">
                      {result.data.staffName} ({result.data.staffId})
                    </span>
                  </div>
                  {result.data.department && (
                    <div className="flex justify-between">
                      <span className="text-[#6A6577]">Department:</span>
                      <span className="font-medium text-[#24212D]">
                        {result.data.department}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#6A6577]">Meal Type:</span>
                    <span className="font-bold text-[#35118F] font-mono">
                      {result.data.mealType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6A6577]">Service Date:</span>
                    <span className="font-mono text-[#24212D]">
                      {result.data.serviceDate}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#35118F] hover:bg-[#2a0d72] text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <RotateCcw className="w-4 h-4 text-[#F5B51B]" />
                  <span>Scan Next Staff Member</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Component */}
      <QrScannerComponent onScan={handleScan} isProcessing={processing} />
    </div>
  );
}

