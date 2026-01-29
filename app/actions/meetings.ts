"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type CreateMeetingState = {
  errors?: {
    title?: string[]
    location?: string[]
    meeting_at?: string[]
    _form?: string[]
  }
  message?: string | null
}

export async function getOpenMeetings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: meetings, error } = await supabase
    .from("meetings")
    .select(`
      *,
      host:profiles!host_id(name, avatar_url),
      participants(count),
      is_participant:participants(user_id),
      comments:comments!meeting_id(count)
    `)
    .eq("status", "recruiting")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching meetings:", error.message)
    return []
  }

  // Add joined status to each meeting
  const meetingsWithStatus = meetings.map(m => ({
    ...m,
    isJoined: user ? m.is_participant.some((p: any) => p.user_id === user.id) : false
  }))

  return meetingsWithStatus
}

export async function joinMeeting(meetingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { error } = await supabase
    .from("participants")
    .insert({
      meeting_id: meetingId,
      user_id: user.id,
      status: "joined"
    })

  if (error) {
    console.error("Error joining meeting:", error)
    throw new Error("Failed to join meeting")
  }

  revalidatePath("/meetings")
  revalidatePath("/my-schedule")
}

export async function leaveMeeting(meetingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("meeting_id", meetingId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error leaving meeting:", error)
    throw new Error("Failed to leave meeting")
  }

  revalidatePath("/meetings")
  revalidatePath("/my-schedule")
}

export async function createMeeting(prevState: CreateMeetingState, formData: FormData): Promise<CreateMeetingState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { message: "Unauthorized" }
  }

  const title = formData.get("title") as string
  const location = formData.get("location") as string
  const dateStr = formData.get("date") as string
  const timeStr = formData.get("time") as string
  const description = formData.get("description") as string

  // Simple validation
  if (!title || !location || !dateStr || !timeStr) {
    return { message: "Please fill in all required fields" }
  }

  const meetingAt = new Date(`${dateStr}T${timeStr}:00`).toISOString()

  const { error } = await supabase.from("meetings").insert({
    host_id: user.id,
    title,
    location,
    meeting_at: meetingAt,
    description,
    status: "recruiting"
  })

  if (error) {
    console.error("Error creating meeting:", error)
    return { message: "Failed to create meeting" }
  }

  revalidatePath("/meetings")
  return { message: null }
}
