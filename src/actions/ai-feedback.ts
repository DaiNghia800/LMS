"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateAiFeedback(answerId: string) {
  try {
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: { question: true },
    });

    if (!answer || !answer.question) return { error: "Data not found" };

    if (answer.aiFeedback) {
        return { success: true, feedback: answer.aiFeedback };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a helpful tutor. The student answered a question incorrectly.
      
      Question: "${answer.question.text}"
      Correct Answer: "${answer.question.correctAnswer}"
      Student's Wrong Answer: "${answer.value}"
      
      Task: Explain briefly (2-3 sentences) why the student is wrong and the logic behind the correct answer.
      Language: Vietnamese.
    `;

    const result = await model.generateContent(prompt);
    const feedbackText = result.response.text();

    // 👇 SỬA Ở ĐÂY: Lưu vào cột aiFeedback
    await prisma.answer.update({
      where: { id: answerId },
      data: { aiFeedback: feedbackText },
    });

    return { success: true, feedback: feedbackText };

  } catch (error) {
    console.error("AI Feedback Error:", error);
    return { error: "AI is busy right now. Try again later." };
  }
}