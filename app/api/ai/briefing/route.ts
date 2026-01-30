import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { googleModel, groqModel, AIProvider } from "@/lib/ai/ai"
import { format } from "date-fns"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { provider = "google" } = (await req.json()) as { provider: AIProvider }
    const today = format(new Date(), "yyyy-MM-dd")

    // 1. Check Cache (Supabase)
    const { data: cachedResponse } = await supabase
      .from("ai_responses" as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("category", "briefing")
      .gte("created_at", `${today}T00:00:00Z`)
      .lte("created_at", `${today}T23:59:59Z`)
      .order("created_at", { ascending: false })
      .limit(1)
      .single() as { data: any }

    if (cachedResponse) {
      console.log("Using cached AI briefing from DB.")
      return NextResponse.json({ 
        ok: true, 
        response: cachedResponse.response, 
        provider: cachedResponse.provider,
        cached: true 
      })
    }

    // 2. Fetch User Data for Prompt
    // Tasks for today
    const { data: tasks } = await supabase
      .from("personal_tasks")
      .select("content, is_completed")
      .eq("user_id", user.id)
      .eq("due_date", today) as { data: any[] | null }

    // Meetings for today (where user is host or participant)
    const { data: meetings } = await supabase
      .from("meetings")
      .select(`
        title,
        location,
        meeting_at,
        participants!inner(user_id)
      `)
      .eq("participants.user_id", user.id)
      .gte("meeting_at", `${today}T00:00:00Z`)
      .lte("meeting_at", `${today}T23:59:59Z`) as { data: any[] | null }

    // 3. Construct Prompt
    const taskCount = tasks?.length || 0
    const completedCount = tasks?.filter(t => t.is_completed).length || 0
    const meetingCount = meetings?.length || 0
    
    const taskList = tasks?.map(t => `- ${t.content} (${t.is_completed ? "완료" : "미완료"})`).join("\n") || "할 일 없음"
    const meetingList = meetings?.map(m => `- ${m.title} (@${m.location}, ${format(new Date(m.meeting_at), "HH:mm")})`).join("\n") || "모임 없음"

    const prompt = `
오늘은 ${today} 입니다. 사용자의 일정을 브리핑해 주세요.
- 오늘의 할 일 (${completedCount}/${taskCount}):
${taskList}

- 오늘의 모임 (${meetingCount}개):
${meetingList}

요구사항:
1. 핵심 위주로 볼드체, 리스트 등 마크다운 형식을 활용하여 보기 좋게 요약해 주세요.
2. 부드럽고 격려하는 톤으로 작성해 주세요.
3. 너무 길지 않게 약 3~4문장 분량으로 작성해 주세요.
`.trim()

    // 4. Call AI Model
    const model = provider === "groq" ? groqModel : googleModel
    
    console.log(`Generating AI briefing using ${provider}...`)
    
    // Check for API Keys
    if (provider === "google" && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return NextResponse.json({ error: "Google API Key is missing." }, { status: 500 })
    }
    if (provider === "groq" && !process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: "Groq API Key is missing." }, { status: 500 })
    }

    const { text, usage } = await generateText({
      model,
      prompt,
      maxTokens: 300,
      system: "사용자의 일정을 요약해주는 친절한 비서입니다. 답변은 반드시 한국어(Korean)로만 작성하세요. 핵심 위주로 3문장 이내로 짧게 작성하세요."
    } as any)

    console.log(`AI Response Token Usage:`, usage)

    // 5. Save to Cache
    const { error: saveError } = await (supabase.from("ai_responses" as any) as any).insert({
      user_id: user.id,
      prompt,
      response: text,
      provider,
      category: "briefing"
    })

    if (saveError) console.error("Failed to save AI response to cache:", saveError)

    return NextResponse.json({ ok: true, response: text, provider })

  } catch (error: any) {
    console.error("AI Briefing Error:", error)
    
    // Check for Quota Error
    if (error?.message?.includes("429") || error?.message?.toLowerCase().includes("quota")) {
        return NextResponse.json({ 
            error: "Quota Exceeded", 
            message: "AI 서비스 할당량이 초과되었습니다. 잠시 후 다시 시도해 주세요." 
        }, { status: 429 })
    }

    return NextResponse.json({ 
        error: "Internal Server Error", 
        message: "AI 브리핑 생성 중 오류가 발생했습니다." 
    }, { status: 500 })
  }
}
