// pages/api/interview/start.js

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ElevenLabsClient } from "elevenlabs";

const elevenlabs = new ElevenLabsClient(process.env.ELEVEN_LABS_API);

export default async function handler(req, res) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const { interviewType } = req.body;

  try {
    // Create new interview session
    const interview = await db.interview.create({
      data: {
        userId,
        title: `${interviewType} Interview Preparation`,
        description: `Practice session for ${interviewType} interview`,
      },
    });

    // Generate initial questions based on interview type
    const prompt = `Generate 5 technical questions for a ${interviewType} interview. Return as a JSON array.`;
    const questions = await generateQuestions(prompt);

    // Save questions to database
    await db.question.createMany({
      data: questions.map((q) => ({
        interviewId: interview.id,
        text: q,
      })),
    });

    // Convert first question to speech
    const audio = await elevenlabs.generate({
      voice: "Rachel",
      text: questions[0],
      model_id: "eleven_monolingual_v2",
    });

    res.status(200).json({
      interviewId: interview.id,
      currentQuestion: questions[0],
      audioUrl: audio,
      remainingQuestions: questions.slice(1),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error starting interview" });
  }
}

async function generateQuestions(prompt) {
  // Call your preferred AI API (OpenAI, Anthropic, etc.)
  // This is a mock implementation
  return [
    "Can you explain your experience with React and Next.js?",
    "How would you optimize a slow-performing web application?",
    "Describe a challenging project you worked on and how you overcame the difficulties.",
    "What's your approach to handling state management in a large application?",
    "How do you ensure code quality in your projects?",
  ];
}
