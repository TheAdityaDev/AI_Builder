"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateAiInsights = async (industry) => {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"]
    }
    
    IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
    Include at least 5 common roles for salary ranges.
    Growth rate should be a percentage.
    Include at least 5 skills and trends.
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  //   clean the response

  const cleanedTest = text.replace(/```(?:json)?\n/g, "").trim();

  return JSON.parse(cleanedTest);
};

export const getIndustriesInsights = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("Unauthenticated");

  // Check if the industry insight already exists
  let industryInsight = await db.industryInsight.findUnique({
    where: { industry: user.industry },
  });

  // If it exists, return it instead of creating a duplicate
  if (industryInsight) return industryInsight;

  const insights = await generateAiInsights(user.industry);

  industryInsight = await db.industryInsight.create({
    data: {
      industry: user.industry,
      ...insights,
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return industryInsight;
};
