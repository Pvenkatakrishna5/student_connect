"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: unknown) => void;
  title?: string;
  description?: string;
}

export default function QRScanner({ onScan, onError, title = "Scan QR Code", description = "Align the QR code within the frame to scan" }: QRScannerProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleError = (error: unknown) => {
    console.error(error);
    setErrorMsg("Could not access camera. Please check your permissions.");
    if (onError) onError(error);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#111118] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 text-center border-b border-white/[0.08]">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center">
        {errorMsg ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
            <p className="text-sm font-bold text-rose-400">{errorMsg}</p>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <Scanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  onScan(result[0].rawValue);
                }
              }}
              onError={handleError}
              components={{
                finder: true,
              }}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { objectFit: "cover" },
              }}
            />
          </div>
        )}
        
        {/* Loading placeholder before camera starts */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
          <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
        </div>
      </div>
    </div>
  );
}
