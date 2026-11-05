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
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Canteen Dashboard</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Meal Collection Verification</h1>
        <p className="text-xs text-slate-500 mt-1">
          Scan the staff member's QR code. Database locks prevent duplicate meal redemptions.
        </p>
      </div>

      {/* Verification Result Display */}
      {result && (
        <div
          className={`rounded-2xl p-6 border shadow-sm transition ${
            result.status === "SUCCESS"
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : result.status === "ALREADY_COLLECTED"
              ? "bg-rose-50 border-rose-300 text-rose-950"
              : result.status === "INELIGIBLE"
              ? "bg-amber-50 border-amber-300 text-amber-950"
              : "bg-red-50 border-red-300 text-red-950"
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 rounded-xl bg-white/80 shadow-sm">
              {result.status === "SUCCESS" ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              ) : result.status === "ALREADY_COLLECTED" ? (
                <XCircle className="w-8 h-8 text-rose-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-600" />
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
                <div className="mt-4 p-4 bg-white/90 rounded-xl border border-black/5 text-xs text-slate-700 space-y-1.5 font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Staff Member:</span>
                    <span className="font-bold text-slate-900">
                      {result.data.staffName} ({result.data.staffId})
                    </span>
                  </div>
                  {result.data.department && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-medium text-slate-800">
                        {result.data.department}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Meal Type:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {result.data.mealType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Date:</span>
                    <span className="font-mono text-slate-800">
                      {result.data.serviceDate}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <RotateCcw className="w-4 h-4" />
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

