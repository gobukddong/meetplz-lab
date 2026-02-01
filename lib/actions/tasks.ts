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
  const timeStr = formData.get("time") as string // HH:mm
  const isPrivate = formData.get("isPrivate") === "on"
  const type = (formData.get("type") as string) || "personal"

  if (!content || !dateStr) return

  const { error } = await supabase.from("personal_tasks").insert({
    user_id: user.id,
    content,
    due_date: dateStr,
    due_time: timeStr || null,
    is_public: !isPrivate, // DB field is is_public, UI is "Private"
    source: type as "personal" | "meeting",
    is_completed: false
  })

  if (error) {
    console.error("Error creating task:", error)
    throw new Error("Failed to create task")
  }

  revalidatePath("/my-schedule")
}

export async function updateTask(taskId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const content = formData.get("content") as string
  const dateStr = formData.get("date") as string // YYYY-MM-DD
  const timeStr = formData.get("time") as string // HH:mm
  const isPrivate = formData.get("isPrivate") === "on"
  const type = (formData.get("type") as string) || "personal"

  if (!content || !dateStr) return

  const { error } = await supabase.from("personal_tasks").update({
    content,
    due_date: dateStr,
    due_time: timeStr || null,
    is_public: !isPrivate,
    source: type as "personal" | "meeting"
  }).eq("id", taskId)

  if (error) {
    console.error("Error updating task:", error)
    throw new Error("Failed to update task")
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

export async function getFriendTasks(friendId: string, monthStr?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from("personal_tasks")
    .select("*")
    .eq("user_id", friendId)
    .eq("is_public", true) // Only public tasks
    .order("due_date", { ascending: true })

  if (monthStr) {
    const [year, month] = monthStr.split("-").map(Number)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)
    
    const startIso = startDate.toISOString().split("T")[0]
    const endIso = endDate.toISOString().split("T")[0]
    
    query = query
      .gte("due_date", startIso)
      .lt("due_date", endIso)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching friend tasks:", error)
    return []
  }

  return data || []
}
