"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Keyboard } from "lucide-react";
import { FoodSpinner } from "@/components/FoodLoader";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  isProcessing?: boolean;
}

export default function QrScannerComponent({ onScan, isProcessing = false }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const scannerRef = useRef<any>(null);
  const containerId = "dbi-qr-reader";

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setCameraError(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Pause and trigger scan callback
          onScan(decodedText);
        },
        () => {
          // Frame error ignored
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Camera permission was denied or camera is not available. You can use manual code verification below."
      );
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      setIsScanning(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="text-center mb-5">
        <h3 className="text-base font-bold text-[#1A162B]">Canteen Verification Scanner</h3>
        <p className="text-xs text-[#6A6577] mt-1">
          Scan the staff member's meal QR code or type the token code directly
        </p>
      </div>

      {/* Camera Video Viewport */}
      <div className="relative mx-auto max-w-sm rounded-2xl overflow-hidden bg-[#1A162B] aspect-square flex items-center justify-center shadow-inner">
        <div id={containerId} className="w-full h-full" />

        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#1A162B] text-[#6A6577]">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-3 text-white/80">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-white">Camera is currently inactive</p>
            <p className="text-xs text-[#A39EB2] mt-1 max-w-xs leading-relaxed">
              Click Start Camera to activate the live QR video reader
            </p>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-[#1A162B]/85 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
            <FoodSpinner className="w-8 h-8 text-[#12B98A] mb-2" />
            <span className="text-xs font-semibold">Verifying meal token...</span>
          </div>
        )}
      </div>

      {cameraError && (
        <div className="mt-4 p-3.5 bg-rose-50 text-rose-700 text-xs rounded-xl font-medium leading-relaxed">
          {cameraError}
        </div>
      )}

      {/* Camera Controls */}
      <div className="mt-5 flex justify-center space-x-3">
        {!isScanning ? (
          <button
            type="button"
            onClick={startScanner}
            disabled={isProcessing}
            className="btn-primary h-10 px-6 rounded-xl text-xs font-bold inline-flex items-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>Start Live Camera</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScanner}
            className="btn-secondary h-10 px-6 rounded-xl text-xs font-semibold inline-flex items-center space-x-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <CameraOff className="w-4 h-4" />
            <span>Stop Camera</span>
          </button>
        )}
      </div>

      {/* Manual Code Entry Fallback */}
      <div className="mt-6 pt-5 border-t border-[#F1EFF7]">
        <div className="text-xs font-semibold text-[#6A6577] mb-2 text-center">
          Or Enter Token Manually
        </div>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6A6577]">
              <Keyboard className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Paste or type QR token (e.g. DBI-2026-11-05-...)"
              className="form-input pl-10 font-mono text-xs h-10 rounded-xl"
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing || !manualCode.trim()}
            className="btn-primary h-10 px-5 rounded-xl text-xs font-bold"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}
