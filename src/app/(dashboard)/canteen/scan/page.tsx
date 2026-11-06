"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6A6577] hover:text-[#35118F] mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Canteen Dashboard</span>
        </Link>
        <h1 className="text-2xl font-semibold text-[#24212D]">
          Meal Collection Verification
        </h1>
        <p className="text-xs text-[#6A6577] mt-1">
          Scan the staff member's QR code. Database locks prevent duplicate meal redemptions.
        </p>
      </div>

      {/* Verification Result Display */}
      {result && (
        <div
          className={`rounded-xl p-5 border transition ${
            result.status === "SUCCESS"
              ? "bg-[#EEFBF6] border-[#12B98A]/30 text-[#0C7A5B]"
              : result.status === "ALREADY_COLLECTED"
              ? "bg-rose-50 border-rose-200 text-rose-950"
              : result.status === "INELIGIBLE"
              ? "bg-[#FEF9ED] border-[#F5B51B]/30 text-[#B88204]"
              : "bg-red-50 border-red-200 text-red-950"
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-white shadow-xs border border-[#E5E2EE]">
              {result.status === "SUCCESS" ? (
                <CheckCircle2 className="w-7 h-7 text-[#12B98A]" />
              ) : result.status === "ALREADY_COLLECTED" ? (
                <XCircle className="w-7 h-7 text-rose-600" />
              ) : (
                <AlertTriangle className="w-7 h-7 text-[#F5B51B]" />
              )}
            </div>

            <div className="flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider block">
                {result.status === "SUCCESS"
                  ? "Collection Approved"
                  : result.status === "ALREADY_COLLECTED"
                  ? "Duplicate Collection Denied"
                  : result.status === "INELIGIBLE"
                  ? "Staff Not Eligible"
                  : "Verification Failed"}
              </span>
              <h2 className="text-base font-semibold mt-0.5">{result.message}</h2>

              {result.data && (
                <div className="mt-3 p-3.5 bg-white rounded-lg border border-[#E5E2EE] text-xs text-[#24212D] space-y-1.5 font-sans">
                  <div className="flex justify-between">
                    <span className="text-[#6A6577]">Staff Member:</span>
                    <span className="font-semibold text-[#24212D]">
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
                    <span className="font-semibold text-[#35118F] font-mono">
                      {result.data.mealType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6A6577]">Service Date:</span>
                    <span className="font-mono text-[#24212D]">
                      {result.data.serviceDate}
                    </span>
                  </div>
                  {result.data.collectedAt && (
                    <div className="flex justify-between">
                      <span className="text-[#6A6577]">Collected At:</span>
                      <span className="font-mono text-[#12B98A]">
                        {new Date(result.data.collectedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                  {result.data.previouslyCollectedAt && (
                    <div className="flex justify-between">
                      <span className="text-[#6A6577]">Previously Collected:</span>
                      <span className="font-mono text-rose-600">
                        {new Date(result.data.previouslyCollectedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={handleReset}
                  className="btn-primary h-10 px-4 text-xs font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
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

