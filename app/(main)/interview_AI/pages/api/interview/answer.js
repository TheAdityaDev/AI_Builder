// pages/api/interview/answer.js
import { auth } from "@clerk/nextjs/server";
import { analyzeAnswer } from "../../lib/ai-analysis";
import { db } from "@/lib/db";

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

  const { questionId, answer } = req.body;

  try {
    // Update question with user's answer
    const updatedQuestion = await db.question.update({
      where: { id: questionId },
      data: { userAnswer: answer },
    });

    // Get AI feedback on the answer
    const feedback = await analyzeAnswer(updatedQuestion.text, answer);

    // Save feedback to database
    await db.question.update({
      where: { id: questionId },
      data: { aiFeedback: feedback },
    });

    res.status(200).json({ feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting answer" });
  }
}
