"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getMyTasks(monthStr?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  let query = supabase
    .from("personal_tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true })

  if (monthStr) {
    // monthStr format: "YYYY-MM"
    const [year, month] = monthStr.split("-").map(Number)
    const startDate = new Date(year, month - 1, 1) // JS month is 0-indexed
    const endDate = new Date(year, month, 1)
    
    const startIso = startDate.toISOString().split("T")[0]
    const endIso = endDate.toISOString().split("T")[0]
    
    query = query
      .gte("due_date", startIso)
      .lt("due_date", endIso)
  }

  const { data: finalTasks, error: finalError } = await query

  if (finalError) {
    console.error("Error fetching tasks:", finalError)
    return []
  }

  return finalTasks || []
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const content = formData.get("content") as string
  const dateStr = formData.get("date") as string // YYYY-MM-DD
  const isPrivate = formData.get("isPrivate") === "on"

  if (!content || !dateStr) return

  const { error } = await supabase.from("personal_tasks").insert({
    user_id: user.id,
    content,
    due_date: dateStr,
    is_public: !isPrivate, // DB field is is_public, UI is "Private"
    source: "personal",
    is_completed: false
  })

  if (error) {
    console.error("Error creating task:", error)
    throw new Error("Failed to create task")
  }

  revalidatePath("/my-schedule")
}

export async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
  const supabase = await createClient()
  await supabase.from("personal_tasks").update({ is_completed: isCompleted }).eq("id", taskId)
  revalidatePath("/my-schedule")
}

export async function toggleTaskPrivacy(taskId: string, currentIsPublic: boolean) {
  const supabase = await createClient()
  await supabase.from("personal_tasks").update({ is_public: !currentIsPublic }).eq("id", taskId)
  revalidatePath("/my-schedule")
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  await supabase.from("personal_tasks").delete().eq("id", taskId)
  revalidatePath("/my-schedule")
}
