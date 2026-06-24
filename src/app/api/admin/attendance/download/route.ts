import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const format = searchParams.get("format") || "csv";

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Missing or invalid date parameter (YYYY-MM-DD)." },
      { status: 400 }
    );
  }

  if (format !== "csv" && format !== "xlsx") {
    return NextResponse.json(
      { error: "Format must be csv or xlsx." },
      { status: 400 }
    );
  }

  // Fetch scan logs for the given date
  const scanLogs = await prisma.scanLog.findMany({
    where: { scanDate: date },
    orderBy: { scannedAt: "asc" },
    select: {
      checkpoint: true,
      scannedAt: true,
      participant: {
        select: {
          fullName: true,
          registrationNumber: true,
        },
      },
    },
  });

  // Group by participant
  const participantMap = new Map<
    string,
    {
      fullName: string;
      registrationNumber: string;
      entryTime: string | null;
      lunchTime: string | null;
    }
  >();

  for (const log of scanLogs) {
    const regNum = log.participant.registrationNumber ?? "N/A";

    if (!participantMap.has(regNum)) {
      participantMap.set(regNum, {
        fullName: log.participant.fullName,
        registrationNumber: regNum,
        entryTime: null,
        lunchTime: null,
      });
    }

    const participant = participantMap.get(regNum)!;

    if (log.checkpoint === "ENTRY") {
      participant.entryTime = formatTime(log.scannedAt);
    } else if (log.checkpoint === "LUNCH") {
      participant.lunchTime = formatTime(log.scannedAt);
    }
  }

  const rows = Array.from(participantMap.values()).map((p) => ({
    "Participant Name": p.fullName,
    "Registration Number": p.registrationNumber,
    "Entry Time": p.entryTime || "",
    "Lunch Time": p.lunchTime || "",
  }));

  const filename = `attendance-${date}`;

  if (format === "xlsx") {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Attendance ${date}`);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 30 }, // Participant Name
      { wch: 20 }, // Registration Number
      { wch: 15 }, // Entry Time
      { wch: 15 }, // Lunch Time
    ];

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }

  // CSV format
  const header = "Participant Name,Registration Number,Entry Time,Lunch Time";
  const csvRows = rows.map(
    (r) =>
      `"${escapeCsv(r["Participant Name"])}","${escapeCsv(r["Registration Number"])}","${escapeCsv(r["Entry Time"])}","${escapeCsv(r["Lunch Time"])}"`
  );
  const csv = [header, ...csvRows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Africa/Nairobi",
  }).format(date);
}

function escapeCsv(value: string): string {
  return value.replace(/"/g, '""');
}
