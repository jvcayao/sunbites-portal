"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudentQrActionsProps {
  qrCode: string;
  studentName: string;
  className?: string;
}

export function StudentQrActions({ qrCode, studentName, className }: StudentQrActionsProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);

  function handleDownload() {
    const svg = svgContainerRef.current?.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const svgDataUri = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));

    const canvas = document.createElement("canvas");
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${studentName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
      link.href = pngUrl;
      link.click();
    };
    img.src = svgDataUri;
  }

  return (
    <>
      {/* Print-only layout — hidden on screen, visible when printing */}
      <div
        className="hidden print:block fixed inset-0 flex flex-col items-center justify-center bg-white p-12"
        aria-hidden="true"
      >
        <p className="text-xl font-bold mb-1">Sunbites</p>
        <p className="text-base font-semibold mb-6">{studentName}</p>
        <QRCode value={qrCode} size={220} />
        <p className="mt-4 text-sm font-mono text-gray-500">{qrCode}</p>
      </div>

      {/* Screen-only buttons */}
      <div className={cn("flex gap-2 print:hidden", className)}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          aria-label="Print QR code"
        >
          <Printer className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Print QR
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownload}
          aria-label="Download QR code as PNG"
        >
          <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Download PNG
        </Button>
      </div>

      {/* Off-screen SVG used for download only — react-qr-code doesn't forwardRef, so query the SVG from the wrapper div */}
      <div ref={svgContainerRef} className="sr-only" aria-hidden="true">
        <QRCode value={qrCode} size={300} />
      </div>
    </>
  );
}
