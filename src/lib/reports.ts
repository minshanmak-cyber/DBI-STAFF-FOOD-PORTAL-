import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatServiceDateDisplay, formatIST } from "./timezone";

export interface MealCountSummary {
  serviceDate: string;
  totalActiveStaff: number;
  breakfastOptIn: number;
  breakfastCollected: number;
  lunchOptIn: number;
  lunchCollected: number;
  dinnerOptIn: number;
  dinnerCollected: number;
  respondedCount: number;
  noResponseCount: number;
}

export interface StaffResponseRow {
  staffId: string;
  fullName: string;
  department: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  updatedAt: string;
}

export interface CollectionLogRow {
  staffId: string;
  fullName: string;
  department: string;
  mealType: string;
  collectedAt: string;
  canteenOperator: string;
}

/**
 * Generate Excel workbook containing Daily Summary, Staff Responses, and Collections.
 */
export async function generateExcelReport(data: {
  serviceDate: string;
  summary: MealCountSummary;
  staffResponses: StaffResponseRow[];
  collections: CollectionLogRow[];
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "DBI Food Management Portal";
  workbook.created = new Date();

  // --- Sheet 1: Daily Food Summary ---
  const summarySheet = workbook.addWorksheet("Daily Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 32 },
    { header: "Value", key: "value", width: 22 },
  ];

  summarySheet.addRows([
    { metric: "Service Date", value: formatServiceDateDisplay(data.serviceDate) },
    { metric: "Total Registered Staff", value: data.summary.totalActiveStaff },
    { metric: "Staff Responded", value: data.summary.respondedCount },
    { metric: "No Response (Default Out)", value: data.summary.noResponseCount },
    { metric: "---", value: "---" },
    { metric: "Breakfast Requested (Opt-In)", value: data.summary.breakfastOptIn },
    { metric: "Breakfast Collected", value: data.summary.breakfastCollected },
    { metric: "Breakfast Remaining / Pending", value: Math.max(0, data.summary.breakfastOptIn - data.summary.breakfastCollected) },
    { metric: "---", value: "---" },
    { metric: "Lunch Requested (Opt-In)", value: data.summary.lunchOptIn },
    { metric: "Lunch Collected", value: data.summary.lunchCollected },
    { metric: "Lunch Remaining / Pending", value: Math.max(0, data.summary.lunchOptIn - data.summary.lunchCollected) },
    { metric: "---", value: "---" },
    { metric: "Dinner Requested (Opt-In)", value: data.summary.dinnerOptIn },
    { metric: "Dinner Collected", value: data.summary.dinnerCollected },
    { metric: "Dinner Remaining / Pending", value: Math.max(0, data.summary.dinnerOptIn - data.summary.dinnerCollected) },
  ]);

  // Style Header
  summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
  summarySheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "102A43" },
  };

  // --- Sheet 2: Staff Responses ---
  const responsesSheet = workbook.addWorksheet("Staff Responses");
  responsesSheet.columns = [
    { header: "Staff ID", key: "staffId", width: 16 },
    { header: "Full Name", key: "fullName", width: 28 },
    { header: "Department", key: "department", width: 22 },
    { header: "Breakfast", key: "breakfast", width: 16 },
    { header: "Lunch", key: "lunch", width: 16 },
    { header: "Dinner", key: "dinner", width: 16 },
    { header: "Last Recorded", key: "updatedAt", width: 24 },
  ];

  data.staffResponses.forEach((row) => responsesSheet.addRow(row));
  responsesSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
  responsesSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "243B53" },
  };

  // --- Sheet 3: Collections Log ---
  const collectionsSheet = workbook.addWorksheet("Collections Log");
  collectionsSheet.columns = [
    { header: "Staff ID", key: "staffId", width: 16 },
    { header: "Full Name", key: "fullName", width: 28 },
    { header: "Department", key: "department", width: 22 },
    { header: "Meal Type", key: "mealType", width: 16 },
    { header: "Collected At (IST)", key: "collectedAt", width: 26 },
    { header: "Verified By (Operator)", key: "canteenOperator", width: 22 },
  ];

  data.collections.forEach((row) => collectionsSheet.addRow(row));
  collectionsSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
  collectionsSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "334E68" },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate PDF report with Summary and Detailed Tables.
 */
export function generatePdfReport(data: {
  serviceDate: string;
  summary: MealCountSummary;
  staffResponses: StaffResponseRow[];
  collections: CollectionLogRow[];
}): Buffer {
  const doc = new jsPDF();

  // Header Title
  doc.setFontSize(18);
  doc.setTextColor(16, 42, 67); // dark blue
  doc.text("DBI Staff Food Management Portal", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(51, 78, 104);
  doc.text(`Daily Service Report: ${formatServiceDateDisplay(data.serviceDate)}`, 14, 28);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated at: ${formatIST(new Date())}`, 14, 34);

  // Summary Table
  autoTable(doc, {
    startY: 40,
    head: [["Meal Type", "Requested (Opt-In)", "Collected", "Pending", "Collection Rate"]],
    body: [
      [
        "Breakfast",
        data.summary.breakfastOptIn.toString(),
        data.summary.breakfastCollected.toString(),
        Math.max(0, data.summary.breakfastOptIn - data.summary.breakfastCollected).toString(),
        data.summary.breakfastOptIn > 0
          ? `${Math.round((data.summary.breakfastCollected / data.summary.breakfastOptIn) * 100)}%`
          : "N/A",
      ],
      [
        "Lunch",
        data.summary.lunchOptIn.toString(),
        data.summary.lunchCollected.toString(),
        Math.max(0, data.summary.lunchOptIn - data.summary.lunchCollected).toString(),
        data.summary.lunchOptIn > 0
          ? `${Math.round((data.summary.lunchCollected / data.summary.lunchOptIn) * 100)}%`
          : "N/A",
      ],
      [
        "Dinner",
        data.summary.dinnerOptIn.toString(),
        data.summary.dinnerCollected.toString(),
        Math.max(0, data.summary.dinnerOptIn - data.summary.dinnerCollected).toString(),
        data.summary.dinnerOptIn > 0
          ? `${Math.round((data.summary.dinnerCollected / data.summary.dinnerOptIn) * 100)}%`
          : "N/A",
      ],
      [
        "Staff Participation",
        `Responded: ${data.summary.respondedCount} / ${data.summary.totalActiveStaff}`,
        `No Response: ${data.summary.noResponseCount}`,
        "-",
        `${Math.round((data.summary.respondedCount / (data.summary.totalActiveStaff || 1)) * 100)}%`,
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [16, 42, 67] },
  });

  // Staff Responses Section
  const summaryEndY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(14);
  doc.setTextColor(16, 42, 67);
  doc.text("Staff Meal Responses", 14, summaryEndY + 14);

  const responseRows = data.staffResponses.slice(0, 40).map((r) => [
    r.staffId,
    r.fullName,
    r.department || "-",
    r.breakfast,
    r.lunch,
    r.dinner,
  ]);

  autoTable(doc, {
    startY: summaryEndY + 18,
    head: [["Staff ID", "Full Name", "Department", "Breakfast", "Lunch", "Dinner"]],
    body: responseRows,
    theme: "striped",
    headStyles: { fillColor: [36, 59, 83] },
    styles: { fontSize: 8 },
  });

  // If there are collections, add a new page or table
  if (data.collections.length > 0) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(16, 42, 67);
    doc.text("Meal Collection Audit Log", 14, 20);

    const collectionRows = data.collections.map((c) => [
      c.staffId,
      c.fullName,
      c.mealType,
      c.collectedAt,
      c.canteenOperator,
    ]);

    autoTable(doc, {
      startY: 26,
      head: [["Staff ID", "Staff Name", "Meal Type", "Collected At (IST)", "Verified By"]],
      body: collectionRows,
      theme: "striped",
      headStyles: { fillColor: [51, 78, 104] },
      styles: { fontSize: 8 },
    });
  }

  const pdfOutput = doc.output("arraybuffer");
  return Buffer.from(pdfOutput);
}

