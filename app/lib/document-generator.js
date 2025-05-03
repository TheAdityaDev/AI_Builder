// lib/document-generator.js

import { PDFDocument, rgb } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun } from "docx";

export async function generatePdf(interview) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 12;
  const margin = 50;

  let y = height - margin;

  // Add title
  page.drawText(interview.title, {
    x: margin,
    y,
    size: fontSize + 4,
    color: rgb(0, 0, 0),
  });
  y -= fontSize + 10;

  // Add date
  page.drawText(`Date: ${new Date(interview.createdAt).toLocaleDateString()}`, {
    x: margin,
    y,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  y -= fontSize + 20;

  // Add questions and answers
  interview.questions.forEach((q, i) => {
    page.drawText(`Question ${i + 1}: ${q.text}`, {
      x: margin,
      y,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    y -= fontSize + 5;

    page.drawText(`Answer: ${q.userAnswer || "No answer provided"}`, {
      x: margin + 20,
      y,
      size: fontSize,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= fontSize + 5;

    if (q.aiFeedback) {
      page.drawText(`Feedback: ${q.aiFeedback}`, {
        x: margin + 20,
        y,
        size: fontSize - 2,
        color: rgb(0.1, 0.5, 0.1),
      });
      y -= fontSize + 15;
    } else {
      y -= 10;
    }

    // Add new page if running out of space
    if (y < margin) {
      page.drawText("Continued on next page...", {
        x: margin,
        y: margin,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      y = height - margin;
      pdfDoc.addPage();
    }
  });

  // Add overall feedback if available
  if (interview.feedback) {
    y -= 20;
    page.drawText("Overall Feedback:", {
      x: margin,
      y,
      size: fontSize + 2,
      color: rgb(0, 0, 0),
    });
    y -= fontSize + 5;

    page.drawText(`Score: ${interview.feedback.overallScore}/10`, {
      x: margin,
      y,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    y -= fontSize + 5;

    page.drawText("Strengths:", {
      x: margin,
      y,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    y -= fontSize + 5;

    interview.feedback.strengths.forEach((strength) => {
      page.drawText(`- ${strength}`, {
        x: margin + 20,
        y,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      y -= fontSize + 5;
    });

    page.drawText("Areas for Improvement:", {
      x: margin,
      y,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    y -= fontSize + 5;

    interview.feedback.improvements.forEach((improvement) => {
      page.drawText(`- ${improvement}`, {
        x: margin + 20,
        y,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      y -= fontSize + 5;
    });

    if (interview.feedback.notes) {
      page.drawText("Additional Notes:", {
        x: margin,
        y,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      y -= fontSize + 5;

      page.drawText(interview.feedback.notes, {
        x: margin + 20,
        y,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    }
  }

  // Save the PDF and return the bytes
  return await pdfDoc.save();
}

export async function generateDocx(interview) {
  // Create a new DOCX document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: interview.title,
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Date: ${new Date(
                  interview.createdAt
                ).toLocaleDateString()}`,
                size: 22,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Add questions and answers
          ...interview.questions.flatMap((q, i) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Question ${i + 1}: ${q.text}`,
                  bold: true,
                  size: 22,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Answer: ${q.userAnswer || "No answer provided"}`,
                  size: 20,
                }),
              ],
              indent: { left: 720 }, // 0.5 inch indent
              spacing: { after: 200 },
            }),
            q.aiFeedback
              ? new Paragraph({
                  children: [
                    new TextRun({
                      text: `Feedback: ${q.aiFeedback}`,
                      color: "2D7D46", // Green color
                      size: 20,
                      italics: true,
                    }),
                  ],
                  indent: { left: 720 },
                  spacing: { after: 400 },
                })
              : new Paragraph({ text: "", spacing: { after: 200 } }),
          ]),

          // Add overall feedback if available
          ...(interview.feedback
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Overall Feedback",
                      bold: true,
                      size: 24,
                      break: 1,
                    }),
                  ],
                  spacing: { before: 600, after: 300 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Score: ${interview.feedback.overallScore}/10`,
                      bold: true,
                      size: 22,
                    }),
                  ],
                  spacing: { after: 200 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Strengths:",
                      bold: true,
                      size: 22,
                    }),
                  ],
                  spacing: { after: 200 },
                }),
                ...interview.feedback.strengths.map(
                  (strength) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${strength}`,
                          size: 20,
                        }),
                      ],
                      indent: { left: 720 },
                      spacing: { after: 100 },
                    })
                ),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Areas for Improvement:",
                      bold: true,
                      size: 22,
                    }),
                  ],
                  spacing: { before: 200, after: 200 },
                }),
                ...interview.feedback.improvements.map(
                  (improvement) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${improvement}`,
                          size: 20,
                        }),
                      ],
                      indent: { left: 720 },
                      spacing: { after: 100 },
                    })
                ),
                ...(interview.feedback.notes
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Additional Notes:",
                            bold: true,
                            size: 22,
                          }),
                        ],
                        spacing: { before: 200, after: 200 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: interview.feedback.notes,
                            size: 20,
                          }),
                        ],
                        indent: { left: 720 },
                      }),
                    ]
                  : []),
              ]
            : []),
        ],
      },
    ],
  });

  // Generate the DOCX file
  return await Packer.toBuffer(doc);
}
