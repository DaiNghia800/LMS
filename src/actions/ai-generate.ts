"use server";

import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Chuyển Buffer thành Base64 và tạo Part cho Gemini
function fileToGenerativePart(buffer: Buffer, mimeType: string): Part {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

export async function generateQuestionsFromFile(formData: FormData) {
  try {
    // 1. Nhận File trực tiếp từ FormData
    const file = formData.get("file") as File;
    if (!file || file.size === 0) return { error: "No file uploaded" };

    // 2. Kiểm tra loại file nghiêm ngặt
    if (!file.type.startsWith("application/pdf") && !file.type.startsWith("image/")) {
      return { error: "Only PDF or Image files are supported for AI analysis." };
    }

    // 3. Kiểm tra kích thước file
    if (file.size > 10 * 1024 * 1024) { 
        return { error: "File size exceeds 10MB limit." };
    }

    // 4. Chuyển File thành Buffer và Part
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePart = fileToGenerativePart(buffer, file.type);
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 5. Định nghĩa Prompt JSON Schema
    const prompt = `
      You are a strict JSON generator. Analyze the content of the attached document.
      
      RULES:
      - Return ONLY a raw JSON array. No markdown, no code blocks, no preamble.
      - Extract all questions into the specified JSON schema.
      - Detect if it is Multiple Choice (MULTIPLE_CHOICE) or Essay (ESSAY).

      JSON Structure Example:
      [
        {
          "text": "Question content",
          "type": "MULTIPLE_CHOICE",
          "options": ["A. Option 1", "B. Option 2"],
          "correctAnswer": "A"
        }
      ]
    `;

    // 6. Gọi AI với cả Prompt và File
    const result = await model.generateContent([prompt, filePart]);
    const textResponse = result.response.text();

    // 7. Xử lý JSON trả về
    const cleanedText = textResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
      
    const questions = JSON.parse(cleanedText);

    return { success: true, data: questions };

  } catch (error) {
    console.error("GEMINI/FILE PARSING ERROR:", error);
    return { error: "Failed to process file with AI. Check if file is clearly formatted." };
  }
}