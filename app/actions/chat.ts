"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendMessage(meetingId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  if (!content.trim()) return

  const { error } = await (supabase as any).from("comments").insert({
    meeting_id: meetingId,
    user_id: user.id,
    content: content.trim()
  })

  if (error) {
    console.error("Error sending message:", error)
    throw new Error("Failed to send message")
  }

  // Realtime will handle the UI update, but revalidating doesn't hurt
  revalidatePath(`/meetings/${meetingId}/chat`)
}

export async function getMessages(meetingId: string) {
  const supabase = await createClient()
  
  const { data: messages, error } = await (supabase as any)
    .from("comments")
    .select(`
      id,
      meeting_id,
      user_id,
      content,
      created_at,
      user:profiles!user_id(name, avatar_url)
    `)
    .eq("meeting_id", meetingId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching messages:", error)
    return []
  }

  return messages as any[]
}
