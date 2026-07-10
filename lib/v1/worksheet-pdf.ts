// AidPilot v1 — client-side worksheet PDF generator (F5).
//
// Runs ENTIRELY in the browser (pdf-lib). It receives already-translated,
// already-collected data and returns a Blob. It performs NO network I/O — the
// caller triggers a local download. Nothing is transmitted (AGENT_RULES.md
// Rule 1). Styled to the design tokens (brand blue, navy ink, amber warning).

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

type Col = ReturnType<typeof rgb>;

const PAGE = { w: 612, h: 792, margin: 54 }; // US Letter
const COLORS = {
  blue: rgb(11 / 255, 92 / 255, 173 / 255), // --blue-700
  ink: rgb(21 / 255, 33 / 255, 46 / 255), // --ink-900
  body: rgb(31 / 255, 41 / 255, 55 / 255), // --ink-800
  gray: rgb(107 / 255, 114 / 255, 128 / 255), // --gray-500
  line: rgb(230 / 255, 237 / 255, 246 / 255), // --border-card
  amberBg: rgb(255 / 255, 247 / 255, 230 / 255), // --amber-100
  amberBorder: rgb(242 / 255, 230 / 255, 200 / 255), // --amber-200
  amberFg: rgb(183 / 255, 121 / 255, 31 / 255), // --amber-600
};

export interface WorksheetRow {
  label: string;
  /** Pre-filled text; when empty a hand-write-in line is drawn instead. */
  value: string;
  /** Review status from the walkthrough ("[x]"/"[ ]" marker + status text). */
  reviewed?: boolean;
  reviewedText?: string;
}
export interface WorksheetSection {
  title: string;
  rows: WorksheetRow[];
}
export interface WorksheetData {
  brand: string;
  title: string;
  generatedOn: string;
  disclaimerTitle: string;
  disclaimer: string;
  sections: WorksheetSection[];
}

function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = (text ?? "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export async function generateWorksheetPdf(data: WorksheetData): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const contentW = PAGE.w - PAGE.margin * 2;

  let page: PDFPage = pdf.addPage([PAGE.w, PAGE.h]);
  let y = PAGE.h - PAGE.margin;

  const ensure = (space: number) => {
    if (y - space < PAGE.margin) {
      page = pdf.addPage([PAGE.w, PAGE.h]);
      y = PAGE.h - PAGE.margin;
    }
  };

  const drawLines = (text: string, f: PDFFont, size: number, color: Col, lh = 1.4) => {
    for (const ln of wrap(text, f, size, contentW)) {
      ensure(size * lh);
      y -= size * lh;
      page.drawText(ln, { x: PAGE.margin, y, size, font: f, color });
    }
  };

  // Header
  ensure(24);
  y -= 22;
  page.drawText(data.brand, { x: PAGE.margin, y, size: 22, font: bold, color: COLORS.blue });
  drawLines(data.title, bold, 15, COLORS.ink, 1.5);
  y -= 2;
  drawLines(data.generatedOn, font, 10, COLORS.gray, 1.4);

  // Divider
  y -= 12;
  ensure(1);
  page.drawLine({
    start: { x: PAGE.margin, y },
    end: { x: PAGE.w - PAGE.margin, y },
    thickness: 1,
    color: COLORS.line,
  });
  y -= 10;

  // Disclaimer box (amber warning)
  {
    const padX = 12;
    const padY = 10;
    const titleLines = wrap(data.disclaimerTitle, bold, 11, contentW - padX * 2);
    const bodyLines = wrap(data.disclaimer, font, 10, contentW - padX * 2);
    const boxH = padY * 2 + titleLines.length * 11 * 1.4 + bodyLines.length * 10 * 1.5 + 4;
    ensure(boxH + 10);
    const top = y;
    page.drawRectangle({
      x: PAGE.margin,
      y: top - boxH,
      width: contentW,
      height: boxH,
      color: COLORS.amberBg,
      borderColor: COLORS.amberBorder,
      borderWidth: 1,
    });
    let ty = top - padY;
    for (const ln of titleLines) {
      ty -= 11 * 1.4;
      page.drawText(ln, { x: PAGE.margin + padX, y: ty, size: 11, font: bold, color: COLORS.amberFg });
    }
    ty -= 4;
    for (const ln of bodyLines) {
      ty -= 10 * 1.5;
      page.drawText(ln, { x: PAGE.margin + padX, y: ty, size: 10, font, color: COLORS.amberFg });
    }
    y = top - boxH - 16;
  }

  // Sections
  for (const s of data.sections) {
    ensure(26);
    y -= 18;
    page.drawText(s.title, { x: PAGE.margin, y, size: 13, font: bold, color: COLORS.blue });
    y -= 2;
    for (const row of s.rows) {
      const marker = row.reviewedText ? `[${row.reviewed ? "x" : " "}] ` : "";
      const suffix = row.reviewedText ? `  (${row.reviewedText})` : "";
      drawLines(`${marker}${row.label}${suffix}`, font, 9.5, COLORS.gray, 1.5);
      if (row.value.trim()) {
        drawLines(row.value, bold, 12, COLORS.body, 1.4);
      } else {
        // Hand-write-in line for the student to fill offline.
        ensure(18);
        y -= 16;
        page.drawLine({
          start: { x: PAGE.margin, y },
          end: { x: PAGE.margin + Math.min(300, contentW), y },
          thickness: 0.8,
          color: COLORS.gray,
        });
      }
      y -= 6;
    }
    y -= 6;
  }

  const bytes = await pdf.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}
