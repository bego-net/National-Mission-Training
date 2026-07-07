"use client";

import { useEffect, useState } from "react";
import type { Gender, MaritalStatus, RegistrationStatus } from "@prisma/client";

type Registration = {
  id: string;
  fullName: string;
  phone: string;
  age: number;
  gender: Gender;
  maritalStatus: MaritalStatus;
  occupation: string;
  address: string;
  churchName: string;
  ministryArea: string;
  needsAccommodation: boolean;
  needsTshirt: boolean;
  tShirtSize?: string | null;
  paymentScreenshot: string;
  status: RegistrationStatus;
  registrationNumber?: string;
  qrCode?: string;
  createdAt: string;
};

type BadgeModalProps = {
  registration: Registration;
  onClose: () => void;
};

export function BadgeModal({ registration, onClose }: BadgeModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handlePrintBadge = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Badge - ${registration.fullName}</title>
          <style>
            @page {
              size: 3.5in 5in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              width: 3.5in;
              height: 5in;
              box-sizing: border-box;
              border: 1px solid #e2e8f0;
              position: relative;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header {
              width: 100%;
              background: linear-gradient(135deg, #1e3a8a, #3730a3);
              color: white;
              text-align: center;
              padding: 20px 10px;
              box-sizing: border-box;
            }
            .header h1 {
              margin: 0;
              font-size: 20px;
              font-weight: 800;
              letter-spacing: 0.5px;
            }
            .header p {
              margin: 4px 0 0 0;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              opacity: 0.9;
            }
            .content {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 15px;
              text-align: center;
            }
            .name {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              line-height: 1.2;
            }
            .church {
              font-size: 13px;
              font-weight: 600;
              color: #475569;
              margin: 6px 0 0 0;
            }
            .qr-container {
              margin: 15px 0;
              border: 2px solid #f1f5f9;
              border-radius: 8px;
              padding: 4px;
              background: white;
            }
            .qr-code {
              width: 120px;
              height: 120px;
              display: block;
            }
            .reg-number {
              font-family: monospace;
              font-size: 13px;
              font-weight: 700;
              color: #1e3a8a;
              background-color: #eff6ff;
              padding: 3px 10px;
              border-radius: 6px;
              border: 1px solid #dbeafe;
              margin: 0;
            }
            .footer {
              width: 100%;
              text-align: center;
              padding: 12px 10px;
              border-top: 1px solid #f1f5f9;
              background-color: #fafafa;
              font-size: 9px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ስምህ ይቀደስ</h1>
            <p>National Mission Training</p>
          </div>
          <div class="content">
            <h2 class="name">${registration.fullName}</h2>
            <div class="church">${registration.churchName}</div>
            
            ${registration.qrCode ? `
              <div class="qr-container">
                <img class="qr-code" src="${registration.qrCode}" alt="QR" />
              </div>
            ` : ""}
            
            ${registration.registrationNumber ? `
              <p class="reg-number">${registration.registrationNumber}</p>
            ` : ""}
          </div>
          <div class="footer">
            Hossana Gospel Movement (HGM)
          </div>
          <script>
            window.onload = function() {
              const imgs = document.getElementsByTagName('img');
              let loadedCount = 0;
              if (imgs.length === 0) {
                doPrint();
              } else {
                for (let i = 0; i < imgs.length; i++) {
                  if (imgs[i].complete) {
                    onImgLoad();
                  } else {
                    imgs[i].addEventListener('load', onImgLoad);
                    imgs[i].addEventListener('error', onImgLoad);
                  }
                }
              }
              function onImgLoad() {
                loadedCount++;
                if (loadedCount === imgs.length) {
                  doPrint();
                }
              }
              function doPrint() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                }, 200);
              }
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadBadge = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 700;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 220);
      gradient.addColorStop(0, "#1e3a8a");
      gradient.addColorStop(1, "#3730a3");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, 220);

      // Header Amharic Text
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText("ስምህ ይቀደስ", canvas.width / 2, 95);

      // Header English subtitle
      ctx.font = "bold 20px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText("NATIONAL MISSION TRAINING", canvas.width / 2, 145);

      // Participant Name
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 42px sans-serif";
      ctx.fillText(registration.fullName, canvas.width / 2, 360);

      // Church Name
      ctx.fillStyle = "#475569";
      ctx.font = "600 26px sans-serif";
      ctx.fillText(registration.churchName, canvas.width / 2, 420);

      // QR Code
      if (registration.qrCode) {
        const qrImage = new Image();
        await new Promise((resolve) => {
          qrImage.onload = () => {
            ctx.drawImage(qrImage, (canvas.width - 260) / 2, 490, 260, 260);
            resolve(null);
          };
          qrImage.onerror = () => resolve(null);
          qrImage.src = registration.qrCode!;
        });
      }

      // Registration Number
      if (registration.registrationNumber) {
        const regText = registration.registrationNumber;
        ctx.font = "bold 24px monospace";
        const textWidth = ctx.measureText(regText).width;

        // Capsule background
        ctx.fillStyle = "#eff6ff";
        ctx.beginPath();
        // @ts-ignore
        if (typeof ctx.roundRect === "function") {
          // @ts-ignore
          ctx.roundRect((canvas.width - textWidth - 40) / 2, 800, textWidth + 40, 50, 10);
        } else {
          ctx.rect((canvas.width - textWidth - 40) / 2, 800, textWidth + 40, 50);
        }
        ctx.fill();

        // Capsule border
        ctx.strokeStyle = "#dbeafe";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#1e3a8a";
        ctx.fillText(regText, canvas.width / 2, 833);
      }

      // Divider
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 910);
      ctx.lineTo(canvas.width - 40, 910);
      ctx.stroke();

      // Footer
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("HOSSANA GOSPEL MOVEMENT (HGM)", canvas.width / 2, 955);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Badge_${registration.fullName.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl bg-white shadow-2xl border border-slate-100/80 overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Participant Badge
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preview and print badge</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-355 transition"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50/50 p-6 flex items-center justify-center">
          {/* Badge Preview (Responsive mock mimicking the printed physical badge) */}
          <div className="w-[280px] h-[400px] flex flex-col justify-between items-center rounded-2xl border border-slate-200/80 bg-white shadow-md overflow-hidden relative select-none">
            {/* Badge Header */}
            <div className="w-full bg-gradient-to-r from-blue-900 to-indigo-950 text-white text-center py-4 px-3 flex flex-col items-center">
              <h3 className="text-lg font-black tracking-wide m-0">ስምህ ይቀደስ</h3>
              <span className="text-[8px] font-bold tracking-widest text-blue-200/95 uppercase mt-0.5">
                National Mission Training
              </span>
            </div>

            {/* Badge Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
              <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                {registration.fullName}
              </h4>
              <span className="text-xs font-semibold text-slate-500 mt-1.5 block">
                {registration.churchName}
              </span>

              {registration.qrCode ? (
                <div className="my-4 border border-slate-100 rounded-xl p-2 bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={registration.qrCode}
                    alt="QR Code"
                    className="w-24 h-24 object-contain block"
                  />
                </div>
              ) : (
                <div className="my-4 w-24 h-24 border-2 border-dashed border-slate-255 rounded-xl flex items-center justify-center text-[10px] text-slate-400">
                  No QR Code
                </div>
              )}

              {registration.registrationNumber ? (
                <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                  {registration.registrationNumber}
                </span>
              ) : (
                <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                  Pending Approval
                </span>
              )}
            </div>

            {/* Badge Footer */}
            <div className="w-full border-t border-slate-100 py-3 text-center bg-slate-50">
              <span className="text-[8px] font-extrabold text-slate-400 tracking-wider">
                HOSSANA GOSPEL MOVEMENT
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isDownloading}
            onClick={() => void handleDownloadBadge()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isDownloading ? "Downloading..." : "Download PNG"}
          </button>

          <button
            type="button"
            onClick={handlePrintBadge}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Badge
          </button>
        </div>
      </div>
    </div>
  );
}
