import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createGroq } from "@ai-sdk/groq"

// 1. Google Gemini Provider
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
})

// 2. Groq Provider
export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// Default models
export const googleModel = google("gemini-1.5-flash")
export const groqModel = groq("llama-3.3-70b-versatile")

export type AIProvider = "google" | "groq"
