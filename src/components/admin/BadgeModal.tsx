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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
            @page { size: 3.5in 5in; margin: 0; }
            * { box-sizing: border-box; }
            body {
              margin: 0; padding: 0;
              font-family: 'Inter', system-ui, sans-serif;
              display: flex; flex-direction: column;
              width: 3.5in; height: 5in;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header {
              width: 100%; position: relative; overflow: hidden;
              background: linear-gradient(135deg, #b91c1c 0%, #dc2626 40%, #ea580c 100%);
              padding: 18px 14px 14px; text-align: center; color: #fff;
            }
            .header svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
            .header-title {
              font-size: 28.8px; font-weight: 900; letter-spacing: 0.3px;
              text-shadow: 0 1px 4px rgba(0,0,0,0.25); margin: 0; position: relative; z-index: 1;
            }
            .header-sub {
              font-size: 11.4px; font-weight: 700; letter-spacing: 2px;
              text-transform: uppercase; opacity: 0.88; margin-top: 4px; position: relative; z-index: 1;
            }
            .gold-line {
              width: 60%; height: 1px; background: linear-gradient(90deg, transparent, #C8A24A, transparent);
              margin: 6px auto 0; position: relative; z-index: 1;
            }
            .body { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 18px; gap: 0; background: #1E4FA3; position: relative; overflow: hidden; }
            .body > * { position: relative; z-index: 1; }
            .body > .deco { position: absolute; z-index: 0; }
            .field-label {
              font-size: 9.9px; font-weight: 700; letter-spacing: 1.5px;
              text-transform: uppercase; color: #C8A24A; margin-bottom: 2px;
              display: flex; align-items: center; gap: 4px;
            }
            .field-value-name { font-size: 22px; font-weight: 900; color: #ffffff; line-height: 1.2; text-align: center; }
            .field-value-church { font-size: 14.3px; font-weight: 600; color: #e5e7eb; text-align: center; }
            .divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, #C8A24A, transparent); margin: 10px 0; }
            .qr-wrap {
              position: relative; margin: 6px 0;
              padding: 8px; border: 1.5px solid #C8A24A; border-radius: 10px; background: #fff;
              box-shadow: 0 0 0 3px rgba(200, 162, 74, 0.2);
            }
            .qr-corner {
              position: absolute; width: 10px; height: 10px;
              border-color: #C8A24A; border-style: solid;
            }
            .qr-corner.tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; border-radius: 3px 0 0 0; }
            .qr-corner.tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; border-radius: 0 3px 0 0; }
            .qr-corner.bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; border-radius: 0 0 0 3px; }
            .qr-corner.br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; border-radius: 0 0 3px 0; }
            .qr-img { width: 100px; height: 100px; display: block; }
            .reg-pill {
              margin-top: 8px; font-size: 13.2px; font-weight: 800; font-family: monospace;
              color: #ffffff; background: rgba(200, 162, 74, 0.15);
              border: 1.5px solid #C8A24A; border-radius: 20px; padding: 3px 14px;
              letter-spacing: 1px;
            }
            .footer {
              width: 100%; position: relative; overflow: hidden;
              background: linear-gradient(135deg, #b91c1c 0%, #dc2626 40%, #ea580c 100%);
              padding: 10px 14px; text-align: center;
            }
            .footer svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
            .footer-text {
              font-size: 10.45px; font-weight: 800; letter-spacing: 1.5px;
              text-transform: uppercase; color: #fff; opacity: 0.92; position: relative; z-index: 1;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <svg viewBox="0 0 252 90" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M-20 70 Q60 20 130 55 Q200 90 272 40" stroke="rgba(251,191,36,0.35)" stroke-width="1.5" fill="none"/>
              <path d="M-20 50 Q80 5 160 45 Q220 75 272 25" stroke="rgba(251,191,36,0.2)" stroke-width="1" fill="none"/>
              <circle cx="220" cy="15" r="30" fill="rgba(255,255,255,0.04)"/>
              <circle cx="30" cy="70" r="25" fill="rgba(255,255,255,0.04)"/>
            </svg>
            <div class="header-title">ስምህ ይቀደስ</div>
            <div class="header-sub">National Mission Training</div>
            <div class="gold-line"></div>
          </div>
          <div class="body">
            <svg class="deco" viewBox="0 0 200 200" preserveAspectRatio="none" fill="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; pointer-events: none; z-index: 0;">
              <path d="M-10 50 Q50 90 100 60 Q150 30 210 70" stroke="#C8A24A" stroke-width="1.2" fill="none"/>
              <path d="M-10 150 Q60 110 120 140 Q180 170 210 130" stroke="#C8A24A" stroke-width="1.2" fill="none"/>
              <circle cx="-10" cy="100" r="40" stroke="#C8A24A" stroke-width="0.8" stroke-dasharray="2,2" fill="none"/>
              <circle cx="210" cy="90" r="35" stroke="#C8A24A" stroke-width="0.8" stroke-dasharray="2,2" fill="none"/>
            </svg>
            <div class="field-label">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#C8A24A" stroke-width="2.5" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ሙሉ ስም
            </div>
            <div class="field-value-name">${registration.fullName}</div>
            <div class="divider"></div>
            <div class="field-label">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#C8A24A" stroke-width="2.5" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              ቤተ ክርስቲያን
            </div>
            <div class="field-value-church">${registration.churchName}</div>
            <div class="divider"></div>
            ${registration.qrCode ? `
              <div class="qr-wrap">
                <div class="qr-corner tl"></div>
                <div class="qr-corner tr"></div>
                <div class="qr-corner bl"></div>
                <div class="qr-corner br"></div>
                <img class="qr-img" src="${registration.qrCode}" alt="QR" />
              </div>
            ` : ""}
            ${registration.registrationNumber ? `<div class="reg-pill">${registration.registrationNumber}</div>` : ""}
          </div>
          <div class="footer">
            <svg viewBox="0 0 252 36" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M-20 25 Q60 5 130 18 Q200 30 272 8" stroke="rgba(251,191,36,0.35)" stroke-width="1.5" fill="none"/>
              <circle cx="30" cy="10" r="18" fill="rgba(255,255,255,0.04)"/>
            </svg>
            <div class="footer-text">Hossana Gospel Movement (HGM)</div>
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
      ctx.fillStyle = "#1E4FA3";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Body background decorations (curves, concentric/dashed circle patterns with low opacity)
      ctx.strokeStyle = "rgba(200, 162, 74, 0.1)";
      ctx.lineWidth = 4;

      // Curve 1
      ctx.beginPath();
      ctx.moveTo(-30, 250);
      ctx.bezierCurveTo(200, 450, 500, 150, 730, 350);
      ctx.stroke();

      // Curve 2
      ctx.beginPath();
      ctx.moveTo(-30, 750);
      ctx.bezierCurveTo(250, 600, 450, 900, 730, 650);
      ctx.stroke();

      // Dashed circle 1
      ctx.beginPath();
      ctx.arc(-20, 500, 180, 0, Math.PI * 2);
      ctx.setLineDash([12, 12]);
      ctx.stroke();

      // Dashed circle 2
      ctx.beginPath();
      ctx.arc(720, 450, 150, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Header Gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 180);
      gradient.addColorStop(0, "#b91c1c");
      gradient.addColorStop(0.45, "#dc2626");
      gradient.addColorStop(1, "#ea580c");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, 180);

      // Gold curve lines in header
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-20, 130);
      ctx.bezierCurveTo(160, 40, 360, 100, 720, 70);
      ctx.stroke();

      ctx.strokeStyle = "rgba(251, 191, 36, 0.2)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-20, 90);
      ctx.bezierCurveTo(200, 10, 440, 80, 720, 40);
      ctx.stroke();

      // Header Amharic Text
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "bold 58px sans-serif";
      ctx.fillText("ስምህ ይቀደስ", canvas.width / 2, 75);

      // Header English subtitle
      ctx.font = "bold 29px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText("NATIONAL MISSION TRAINING", canvas.width / 2, 115);

      // Gold Line under subtitle
      ctx.strokeStyle = "#C8A24A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 150, 135);
      ctx.lineTo(canvas.width / 2 + 150, 135);
      ctx.stroke();

      // Label "ሙሉ ስም"
      ctx.fillStyle = "#C8A24A";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("ሙሉ ስም", canvas.width / 2, 230);

      // Participant Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 55px sans-serif";
      ctx.fillText(registration.fullName, canvas.width / 2, 290);

      // Divider 1
      ctx.strokeStyle = "#C8A24A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 320);
      ctx.lineTo(canvas.width - 80, 320);
      ctx.stroke();

      // Label "ቤተ ክርስቲያን"
      ctx.fillStyle = "#C8A24A";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("ቤተ ክርስቲያን", canvas.width / 2, 365);

      // Church Name
      ctx.fillStyle = "#e5e7eb";
      ctx.font = "600 34px sans-serif";
      ctx.fillText(registration.churchName, canvas.width / 2, 420);

      // Divider 2
      ctx.strokeStyle = "#C8A24A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 450);
      ctx.lineTo(canvas.width - 80, 450);
      ctx.stroke();

      // QR Code with Gold Frame and Corners
      if (registration.qrCode) {
        // Draw white background card for QR code
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(220, 485, 260, 260, 10);
          ctx.fill();
        } else {
          ctx.fillRect(220, 485, 260, 260);
        }

        // Draw frame box
        ctx.strokeStyle = "#C8A24A";
        ctx.lineWidth = 3;
        ctx.strokeRect(220, 485, 260, 260);

        // Corner brackets
        ctx.strokeStyle = "#C8A24A";
        ctx.lineWidth = 5;
        
        // Top-Left
        ctx.beginPath();
        ctx.moveTo(240, 485);
        ctx.lineTo(220, 485);
        ctx.lineTo(220, 505);
        ctx.stroke();

        // Top-Right
        ctx.beginPath();
        ctx.moveTo(460, 485);
        ctx.lineTo(480, 485);
        ctx.lineTo(480, 505);
        ctx.stroke();

        // Bottom-Left
        ctx.beginPath();
        ctx.moveTo(240, 745);
        ctx.lineTo(220, 745);
        ctx.lineTo(220, 725);
        ctx.stroke();

        // Bottom-Right
        ctx.beginPath();
        ctx.moveTo(460, 745);
        ctx.lineTo(480, 745);
        ctx.lineTo(480, 725);
        ctx.stroke();

        const qrImage = new Image();
        await new Promise((resolve) => {
          qrImage.onload = () => {
            ctx.drawImage(qrImage, 230, 495, 240, 240);
            resolve(null);
          };
          qrImage.onerror = () => resolve(null);
          qrImage.src = registration.qrCode!;
        });
      }

      // Registration Number
      if (registration.registrationNumber) {
        const regText = registration.registrationNumber;
        ctx.font = "bold 32px monospace";
        const textWidth = ctx.measureText(regText).width;
        const pillW = textWidth + 40;
        const pillH = 50;
        const pillX = (canvas.width - pillW) / 2;
        const pillY = 785;

        // Capsule background
        ctx.fillStyle = "rgba(200, 162, 74, 0.15)";
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(pillX, pillY, pillW, pillH, 25);
        } else {
          ctx.rect(pillX, pillY, pillW, pillH);
        }
        ctx.fill();

        // Capsule border
        ctx.strokeStyle = "#C8A24A";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.fillText(regText, canvas.width / 2, pillY + 35);
      }

      // Footer Gradient
      const footerGrad = ctx.createLinearGradient(0, 880, canvas.width, 1000);
      footerGrad.addColorStop(0, "#b91c1c");
      footerGrad.addColorStop(0.45, "#dc2626");
      footerGrad.addColorStop(1, "#ea580c");
      ctx.fillStyle = footerGrad;
      ctx.fillRect(0, 880, canvas.width, 120);

      // Gold curve in footer
      ctx.strokeStyle = "rgba(251, 191, 36, 0.35)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-20, 950);
      ctx.bezierCurveTo(160, 890, 360, 930, 720, 900);
      ctx.stroke();

      // Footer Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("HOSSANA GOSPEL MOVEMENT (HGM)", canvas.width / 2, 945);

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
          {/* Badge Preview */}
          <div className="w-[260px] flex flex-col rounded-2xl shadow-xl overflow-hidden border border-slate-200/60 select-none bg-white">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-500 to-orange-500 text-white text-center px-4 pt-4 pb-3 flex flex-col items-center">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 90" preserveAspectRatio="none" fill="none">
                <path d="M-10 65 Q65 20 130 50 Q195 80 270 35" stroke="rgba(251,191,36,0.4)" stroke-width="1.5" fill="none"/>
                <path d="M-10 45 Q75 5 155 40 Q215 68 270 20" stroke="rgba(251,191,36,0.2)" stroke-width="1" fill="none"/>
                <circle cx="215" cy="12" r="28" fill="rgba(255,255,255,0.04)"/>
              </svg>
              <h3 className="relative z-10 text-[22.8px] font-black tracking-wide leading-tight">ስምህ ይቀደስ</h3>
              <span className="relative z-10 text-[10.2px] font-bold tracking-[2px] uppercase opacity-90 mt-0.5">National Mission Training</span>
              <div className="relative z-10 mt-2 w-3/5 h-px bg-gradient-to-r from-transparent via-[#C8A24A] to-transparent" />
            </div>

            {/* Body */}
            <div className="relative flex-1 flex flex-col items-center px-5 py-4 gap-0 bg-[#1E4FA3] overflow-hidden">
              <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none z-0" viewBox="0 0 200 200" preserveAspectRatio="none" fill="none">
                <path d="M-10 50 Q50 90 100 60 Q150 30 210 70" stroke="#C8A24A" stroke-width="1.2" fill="none"/>
                <path d="M-10 150 Q60 110 120 140 Q180 170 210 130" stroke="#C8A24A" stroke-width="1.2" fill="none"/>
                <circle cx="-10" cy="100" r="40" stroke="#C8A24A" stroke-width="0.8" stroke-dasharray="2,2" fill="none"/>
                <circle cx="210" cy="90" r="35" stroke="#C8A24A" stroke-width="0.8" stroke-dasharray="2,2" fill="none"/>
              </svg>
              <div className="relative z-10 w-full flex flex-col items-center gap-0">
                {/* Name */}
                <div className="flex items-center gap-1 text-[9.35px] font-bold uppercase tracking-[1.5px] text-[#C8A24A] mb-1">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  ሙሉ ስም
                </div>
                <p className="text-[19.8px] font-black text-white leading-snug text-center mb-0">{registration.fullName}</p>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C8A24A]/40 to-transparent my-3" />
                {/* Church */}
                <div className="flex items-center gap-1 text-[9.35px] font-bold uppercase tracking-[1.5px] text-[#C8A24A] mb-1">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  ቤተ ክርስቲያን
                </div>
                <p className="text-[14.3px] font-semibold text-gray-200 text-center mb-0">{registration.churchName}</p>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C8A24A]/40 to-transparent my-3" />
                {/* QR */}
                {registration.qrCode ? (
                  <div className="relative p-1.5 border border-[#C8A24A] rounded-lg bg-white shadow-sm">
                    <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-[#C8A24A] rounded-tl-md" />
                    <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-[#C8A24A] rounded-tr-md" />
                    <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-[#C8A24A] rounded-bl-md" />
                    <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-[#C8A24A] rounded-br-md" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={registration.qrCode} alt="QR" className="w-20 h-20 block object-contain" />
                  </div>
                ) : (
                  <div className="w-20 h-20 border-2 border-dashed border-[#C8A24A]/40 rounded-lg flex items-center justify-center text-[9.9px] text-[#C8A24A]/60 font-semibold">No QR</div>
                )}
                {/* Reg Number */}
                {registration.registrationNumber ? (
                  <span className="mt-3 font-mono text-[13.2px] font-bold text-white bg-[#C8A24A]/25 border border-[#C8A24A] px-3 py-1 rounded-full tracking-wide">
                    {registration.registrationNumber}
                  </span>
                ) : (
                  <span className="mt-3 text-[9.9px] text-white font-semibold bg-[#C8A24A]/10 px-2 py-0.5 rounded-full border border-[#C8A24A]/45">Pending Approval</span>
                )}
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-500 to-orange-500 py-2.5 text-center">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 32" preserveAspectRatio="none" fill="none">
                <path d="M-10 22 Q65 5 130 16 Q195 27 270 8" stroke="rgba(251,191,36,0.35)" stroke-width="1.5" fill="none"/>
              </svg>
              <span className="relative z-10 text-[9.35px] font-extrabold uppercase tracking-[1.5px] text-white opacity-90">Hossana Gospel Movement (HGM)</span>
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
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:from-red-700 hover:to-orange-600"
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
