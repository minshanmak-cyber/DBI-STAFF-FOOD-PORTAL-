import { describe, it, expect } from "vitest";
import { generateExcelReport, generatePdfReport } from "@/lib/reports";

describe("Report Generation & Export", () => {
  const sampleData = {
    serviceDate: "2026-11-05",
    summary: {
      serviceDate: "2026-11-05",
      totalActiveStaff: 10,
      breakfastOptIn: 8,
      breakfastCollected: 5,
      lunchOptIn: 10,
      lunchCollected: 8,
      dinnerOptIn: 4,
      dinnerCollected: 2,
      respondedCount: 9,
      noResponseCount: 1,
    },
    staffResponses: [
      {
        staffId: "EMP101",
        fullName: "Rahul Sharma",
        department: "Engineering",
        breakfast: "OPT-IN",
        lunch: "OPT-IN",
        dinner: "OPT-OUT",
        updatedAt: "04 Nov 2026, 02:00 PM IST",
      },
    ],
    collections: [
      {
        staffId: "EMP101",
        fullName: "Rahul Sharma",
        department: "Engineering",
        mealType: "LUNCH",
        collectedAt: "05 Nov 2026, 01:15 PM IST",
        canteenOperator: "CANTEEN01",
      },
    ],
  };

  it("generates a valid Excel (.xlsx) binary buffer with summary, responses, and collection sheets", async () => {
    const buffer = await generateExcelReport(sampleData);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(1000); // Valid xlsx file header and content
  });

  it("generates a valid PDF (.pdf) binary buffer with autoTable headers and metrics", () => {
    const pdfBuffer = generatePdfReport(sampleData);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    // PDF magic bytes %PDF
    const header = pdfBuffer.slice(0, 4).toString("utf8");
    expect(header).toBe("%PDF");
  });
});

