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

export async function sendDirectMessage(receiverId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  if (!content.trim()) return

  const { error } = await (supabase as any).from("direct_messages").insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content: content.trim()
  })

  if (error) {
    console.error("Error sending private message:", error)
    throw new Error("Failed to send message")
  }

  // Optional: revalidatePath if needed, but Realtime is preferred for DMs
}

export async function getDirectMessages(friendId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: messages, error } = await (supabase as any)
    .from("direct_messages")
    .select(`
      id,
      sender_id,
      receiver_id,
      content,
      created_at,
      sender:profiles!sender_id(name, avatar_url)
    `)
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching private messages:", error)
    return []
  }

  return messages as any[]
}

