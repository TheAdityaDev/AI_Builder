// pages/api/interview/complete.js

import { db } from "@/lib/db";
import { generateOverallFeedback } from "../../lib/ai-analysis";
import { auth } from "@clerk/nextjs/server";

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
  const { interviewId } = req.body;

  try {
    // Get all questions and answers for this interview
    const questions = await db.question.findMany({
      where: { interviewId },
    });

    // Generate overall feedback
    const overallFeedback = await generateOverallFeedback(questions);

    // Save feedback to database
    const feedback = await db.feedback.create({
      data: {
        interviewId,
        overallScore: overallFeedback.score,
        strengths: overallFeedback.strengths,
        improvements: overallFeedback.improvements,
        notes: overallFeedback.summary,
      },
    });

    res.status(200).json({ overallFeedback: feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error completing interview" });
  }
}
