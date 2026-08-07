"use client";

import { useState } from "react";
import QRScanner from "@/components/ui/QRScanner";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle2, ScanLine, QrCode } from "lucide-react";

export default function QRFeaturePage() {
  const [activeTab, setActiveTab] = useState<"scan" | "generate">("scan");
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [qrText, setQrText] = useState("https://studentconnect.in/profile/sample");
  const [copied, setCopied] = useState(false);

  const handleScan = (result: string) => {
    setScannedResult(result);
  };

  const copyToClipboard = () => {
    if (scannedResult) {
      navigator.clipboard.writeText(scannedResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black text-white mb-3">QR Operations</h1>
          <p className="text-slate-500">Scan user profiles, check-in for jobs, or generate your own QR code.</p>
        </header>

        {/* Custom Tabs */}
        <div className="flex p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab("scan")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "scan" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <ScanLine className="w-4 h-4" /> Scan QR
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "generate" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"
            }`}
          >
            <QrCode className="w-4 h-4" /> Generate QR
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white/[0.02] border border-white/[0.04] p-8 rounded-[32px] min-h-[400px]">
          {activeTab === "scan" ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {scannedResult ? (
                <div className="bg-[#111118] border border-emerald-500/30 p-8 rounded-3xl text-center shadow-xl">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Scan Successful!</h3>
                  <p className="text-sm text-slate-500 mb-6">Here is the data we found in the QR code:</p>
                  
                  <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-xl flex items-center justify-between mb-6 text-left break-all">
                    <span className="text-emerald-400 font-mono text-sm">{scannedResult}</span>
                    <button 
                      onClick={copyToClipboard}
                      className="ml-4 p-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-colors text-slate-400 hover:text-white shrink-0"
                      title="Copy to clipboard"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <button 
                    onClick={() => setScannedResult(null)}
                    className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                  >
                    Scan Another Code
                  </button>
                </div>
              ) : (
                <QRScanner onScan={handleScan} />
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
              <div className="w-full max-w-sm space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1 block mb-2">Data to encode</label>
                  <input 
                    type="text" 
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all"
                    placeholder="Enter link, text, or ID..."
                  />
                </div>

                <div className="bg-white p-8 rounded-3xl flex justify-center items-center shadow-xl shadow-white/5">
                  <QRCodeSVG 
                    value={qrText || "empty"} 
                    size={220}
                    level="H"
                    includeMargin={false}
                    fgColor="#050508"
                    bgColor="#ffffff"
                  />
                </div>
                
                <p className="text-center text-xs text-slate-500 font-medium">
                  Scan this code with any camera app or our built-in scanner.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
