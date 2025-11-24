"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function reviewEssay(answerId: string) {
  try {
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: { question: true },
    });

    if (!answer || !answer.question) return { error: "Data not found" };

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a strict but helpful teacher grading an essay.
      
      Question: "${answer.question.text}"
      Student's Answer: "${answer.value}"
      
      Task: 
      1. Identify grammar/spelling mistakes.
      2. Evaluate the content.
      3. Suggest a score out of 10 (Format: "Suggested Score: X/10").
      4. Provide constructive feedback in Vietnamese.
      
      Keep it concise (under 150 words).
    `;

    const result = await model.generateContent(prompt);
    const feedback = result.response.text();

    return { success: true, feedback: feedback };

  } catch (error) {
    return { error: "AI is busy. Please try again." };
  }
}