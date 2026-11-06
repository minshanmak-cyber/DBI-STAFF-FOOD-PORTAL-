"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Keyboard, Loader2 } from "lucide-react";

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
    <div className="bg-white rounded-2xl border border-[#E5E2EE] p-6 shadow-xs">
      <div className="text-center mb-4">
        <h3 className="text-base font-semibold text-[#24212D]">Canteen Verification Scanner</h3>
        <p className="text-xs text-[#6A6577] mt-1">
          Scan the staff member's meal QR code or type the token code directly
        </p>
      </div>

      {/* Camera Video Viewport */}
      <div className="relative mx-auto max-w-sm rounded-xl overflow-hidden bg-[#24212D] border border-[#24212D] aspect-square flex items-center justify-center">
        <div id={containerId} className="w-full h-full" />

        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#24212D] text-[#6A6577]">
            <Camera className="w-12 h-12 mb-3 text-[#6A6577]" />
            <p className="text-sm font-medium text-slate-200">Camera is currently inactive</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Click Start Camera to activate the live QR video reader
            </p>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-[#24212D]/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#F5B51B] mb-2" />
            <span className="text-sm font-medium">Verifying with server...</span>
          </div>
        )}
      </div>

      {cameraError && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {cameraError}
        </div>
      )}

      {/* Camera Controls */}
      <div className="mt-4 flex justify-center space-x-3">
        {!isScanning ? (
          <button
            type="button"
            onClick={startScanner}
            disabled={isProcessing}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#35118F] hover:bg-[#2a0d72] text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-xs"
          >
            <Camera className="w-4 h-4 text-[#F5B51B]" />
            <span>Start Live Camera</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScanner}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#F6F5FA] hover:bg-[#E5E2EE] text-[#24212D] border border-[#E5E2EE] rounded-xl text-sm font-semibold transition"
          >
            <CameraOff className="w-4 h-4 text-rose-500" />
            <span>Stop Camera</span>
          </button>
        )}
      </div>

      {/* Manual Code Entry Fallback */}
      <div className="mt-6 pt-6 border-t border-[#E5E2EE]">
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6A6577]">
              <Keyboard className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Paste or type QR token (e.g. DBI-2026-11-05-...)"
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E2EE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35118F] font-mono text-[#24212D] bg-white placeholder-[#6A6577]"
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing || !manualCode.trim()}
            className="px-5 py-2 bg-[#35118F] hover:bg-[#2a0d72] text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 shadow-xs"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}

