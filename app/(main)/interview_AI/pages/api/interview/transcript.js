// pages/api/interview/transcript.js

import { auth } from "@clerk/nextjs/server";
import { generatePdf, generateDocx } from "../../lib/document-generator";
import { db } from "@/lib/prisma";

export default async function handler(req, res) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const { interviewId, format } = req.body;

  try {
    // Get interview data
    const interview = await db.interview.findUnique({
      where: { id: interviewId },
      include: {
        questions: true,
        feedback: true,
      },
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Generate the document based on requested format
    let document;
    if (format === "pdf") {
      document = await generatePdf(interview);
      res.setHeader("Content-Type", "application/pdf");
    } else if (format === "docx") {
      document = await generateDocx(interview);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
    } else {
      return res.status(400).json({ message: "Invalid format" });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=interview-transcript.${format}`
    );
    res.send(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating transcript" });
  }
}
