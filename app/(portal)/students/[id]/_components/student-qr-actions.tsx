"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCardAccentColors } from "@/lib/utils/card-accent-colors";
import { cn } from "@/lib/utils";

import type { StudentSummary } from "@/types/portal";

interface StudentQrActionsProps {
  student: StudentSummary;
  blobUrl: string | null;
  className?: string;
}

export function StudentQrActions({
  student,
  blobUrl,
  className,
}: StudentQrActionsProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const printColors = getCardAccentColors(student.student_type);
  const qrCode = student.qr_code ?? "";

  function handleDownload() {
    const svg = svgContainerRef.current?.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const svgDataUri =
      "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgStr)));

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
      link.download = `${student.full_name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
      link.href = pngUrl;
      link.click();
    };
    img.src = svgDataUri;
  }

  return (
    <>
      <style>{`
        .portal-print-only { display: none; }
        @media print {
          @page { size: 53.98mm 85.6mm portrait; margin: 0; }
          body { visibility: hidden; }
          .portal-print-only {
            display: flex !important;
            visibility: visible;
            position: fixed;
            top: 0; left: 0;
            width: 100vw; min-height: 100vh;
            justify-content: center;
            align-items: flex-start;
            padding: 0;
            background: white;
            z-index: 9999;
          }
          .portal-print-only * { visibility: visible; }
        }
      `}</style>

      {/* Print-only canteen ID card — matches POS individual ID print */}
      <div className="portal-print-only" aria-hidden="true">
        <div
          style={{
            width: "53.98mm",
            height: "85.6mm",
            display: "flex",
            flexDirection: "column",
            border: `1.5px solid ${printColors.borderColor}`,
            borderRadius: "3mm",
            overflow: "hidden",
            backgroundColor: "white",
            fontFamily: "sans-serif",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: printColors.headerBg,
              padding: "2mm 3mm",
              flexShrink: 0,
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: printColors.headerText,
                fontWeight: 800,
                fontSize: "8px",
                letterSpacing: "0.3px",
              }}
            >
              🍽 SUNBITES KITCHEN
            </div>
            <div
              style={{
                color: printColors.headerSubText,
                fontSize: "7px",
                marginTop: "0.5mm",
              }}
            >
              Student Canteen ID
            </div>
          </div>

          {/* Body */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "3mm 3mm 2mm",
              gap: "1.5mm",
              overflow: "hidden",
            }}
          >
            {blobUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob URL; next/image does not support blob: scheme
              <img
                src={blobUrl}
                alt={student.full_name}
                style={{
                  width: "18mm",
                  height: "18mm",
                  objectFit: "cover",
                  borderRadius: "2mm",
                  border: `1px solid ${printColors.accentColor}`,
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: "18mm",
                  height: "18mm",
                  borderRadius: "2mm",
                  border: `1px solid ${printColors.accentColor}`,
                  backgroundColor: printColors.avatarBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "8mm",
                  fontWeight: 800,
                  color: printColors.accentColor,
                  flexShrink: 0,
                }}
              >
                {student.first_name.charAt(0).toUpperCase()}
              </div>
            )}
            <p
              style={{
                fontWeight: 700,
                fontSize: "9px",
                textAlign: "center",
                margin: 0,
                color: "#111",
              }}
            >
              {student.full_name}
            </p>
            <p
              style={{
                color: printColors.accentColor,
                fontSize: "8px",
                margin: 0,
                fontWeight: 600,
              }}
            >
              {student.grade_level}
            </p>
            <p style={{ color: "#555", fontSize: "7px", margin: 0 }}>
              🍽{" "}
              {student.student_type === "subscription"
                ? "Subscription"
                : "Non-Subscription"}
            </p>
            <div
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "2mm",
                padding: "1.5mm",
                marginTop: "1mm",
              }}
            >
              <QRCode
                value={qrCode || "placeholder"}
                size={85}
                style={{ width: "22mm", height: "22mm" }}
              />
            </div>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "5px",
                color: "#888",
                margin: 0,
                textAlign: "center",
              }}
            >
              {qrCode}
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              flexShrink: 0,
              backgroundColor: printColors.footerBg,
              borderTop: `1px solid ${printColors.footerBorder}`,
              padding: "1.5mm 3mm",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "5.5px", color: "#666", margin: 0 }}>
              Scan QR to view wallet balance
            </p>
          </div>
        </div>
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

      {/* Off-screen SVG used for download — react-qr-code has no forwardRef */}
      <div ref={svgContainerRef} className="sr-only" aria-hidden="true">
        <QRCode value={qrCode} size={300} />
      </div>
    </>
  );
}
