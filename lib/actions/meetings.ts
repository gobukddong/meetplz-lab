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
  
  // 1. Fetch meetings that are 'recruiting'
  const { data: meetings, error } = await supabase
    .from("meetings")
    .select(`
      *,
      host:profiles!host_id(name, avatar_url),
      participants(count),
      is_participant:participants(user_id),
      comments(count)
    `)
    .eq("status", "recruiting")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching meetings:", error.message)
    return []
  }

  // 2. Filter out meetings where deadline has passed and add joined status
  const now = new Date()
  const activeMeetings = ((meetings as any[]) || [])
    .filter(m => {
      if (!m.recruitment_deadline) return true
      return new Date(m.recruitment_deadline) >= now
    })
    .map(m => ({
      ...m,
      isJoined: user ? m.is_participant.some((p: any) => p.user_id === user.id) : false
    }))

  return activeMeetings
}

export async function joinMeeting(meetingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: meeting, error: fetchError } = await supabase
    .from("meetings")
    .select("*, participants(count)")
    .eq("id", meetingId)
    .single()

  if (fetchError || !meeting) {
    throw new Error("Meeting not found")
  }

  // 1. Check Deadline
  const m = meeting as any
  if (m.recruitment_deadline && new Date(m.recruitment_deadline) < new Date()) {
    throw new Error("모집 기간이 종료된 모임입니다.")
  }

  // 2. Check Capacity
  const currentCount = m.participants[0]?.count || 0
  if (m.max_participants && currentCount >= m.max_participants) {
    throw new Error("모집 인원이 가득 찼습니다.")
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
  const startTimeStr = formData.get("startTime") as string
  const endTimeStr = formData.get("endTime") as string
  const description = formData.get("description") as string
  const maxParticipants = formData.get("maxParticipants") ? parseInt(formData.get("maxParticipants") as string) : null
  const deadlineStr = formData.get("deadline") as string

  // Simple validation
  if (!title || !location || !dateStr || !startTimeStr) {
    return { message: "Please fill in all required fields" }
  }

  const meetingAt = new Date(`${dateStr}T${startTimeStr}:00`).toISOString()
  const meetingEndAt = endTimeStr ? new Date(`${dateStr}T${endTimeStr}:00`).toISOString() : null
  const deadlineAt = deadlineStr ? new Date(`${deadlineStr}T23:59:59`).toISOString() : null

  const { error } = await supabase.from("meetings").insert({
    host_id: user.id,
    title,
    location,
    meeting_at: meetingAt,
    meeting_end_at: meetingEndAt,
    description,
    status: "recruiting",
    max_participants: maxParticipants,
    recruitment_deadline: deadlineAt
  })

  if (error) {
    console.error("Error creating meeting:", error)
    return { message: "Failed to create meeting" }
  }

  revalidatePath("/meetings")
  revalidatePath("/")
  return { message: null }
}

export async function deleteMeeting(meetingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("meetings")
    .delete()
    .eq("id", meetingId)
    .eq("host_id", user.id)

  if (error) {
    console.error("Error deleting meeting:", error)
    throw new Error("Failed to delete meeting")
  }

  revalidatePath("/meetings")
  revalidatePath("/")
}

export async function updateMeeting(meetingId: string, formData: FormData): Promise<CreateMeetingState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { message: "Unauthorized" }
  }

  const title = formData.get("title") as string
  const location = formData.get("location") as string
  const dateStr = formData.get("date") as string
  const startTimeStr = formData.get("startTime") as string
  const endTimeStr = formData.get("endTime") as string
  const description = formData.get("description") as string
  const maxParticipants = formData.get("maxParticipants") ? parseInt(formData.get("maxParticipants") as string) : null
  const deadlineStr = formData.get("deadline") as string

  if (!title || !location || !dateStr || !startTimeStr) {
    return { message: "Please fill in all required fields" }
  }

  const meetingAt = new Date(`${dateStr}T${startTimeStr}:00`).toISOString()
  const meetingEndAt = endTimeStr ? new Date(`${dateStr}T${endTimeStr}:00`).toISOString() : null
  const deadlineAt = deadlineStr ? new Date(`${deadlineStr}T23:59:59`).toISOString() : null

  const { error } = await supabase
    .from("meetings")
    .update({
      title,
      location,
      meeting_at: meetingAt,
      meeting_end_at: meetingEndAt,
      description,
      max_participants: maxParticipants,
      recruitment_deadline: deadlineAt
    })
    .eq("id", meetingId)
    .eq("host_id", user.id)

  if (error) {
    console.error("Error updating meeting:", error)
    return { message: "Failed to update meeting" }
  }

  revalidatePath("/meetings")
  revalidatePath("/")
  revalidatePath("/my-schedule")
  return { message: null }
}
