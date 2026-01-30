"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Search users by name or email
 */
export async function searchUsers(query: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []
  if (!query.trim()) return []

  // Search by name or email, excluding self
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, email")
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .neq("id", user.id)
    .limit(10)

  if (error) {
    console.error("Error searching users:", error)
    return []
  }

  // Check relationship status for each result
  const { data: relations } = await (supabase as any)
    .from("friends")
    .select("*")
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

  return data.map((profile) => {
    const relation = (relations as any[])?.find(
        (r: any) => (r.user_id === profile.id && r.friend_id === user.id) || 
             (r.user_id === user.id && r.friend_id === profile.id)
    )
    return {
      ...profile,
      status: relation?.status || "none",
      requestId: relation?.id || null,
      isOutgoing: relation?.user_id === user.id
    }
  })
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(friendId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await (supabase as any).from("friends").insert({
    user_id: user.id,
    friend_id: friendId,
    status: "pending"
  })

  if (error) {
    console.error("Error sending friend request:", error)
    throw new Error("Failed to send request")
  }

  revalidatePath("/")
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(requestId: string) {
  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from("friends")
    .update({ status: "accepted" })
    .eq("id", requestId)

  if (error) {
    console.error("Error accepting friend request:", error)
    throw new Error("Failed to accept request")
  }

  revalidatePath("/")
}

/**
 * Reject or Unfriend
 */
export async function deleteFriend(requestId: string) {
  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from("friends")
    .delete()
    .eq("id", requestId)

  if (error) {
    console.error("Error deleting friend record:", error)
    throw new Error("Failed to delete record")
  }

  revalidatePath("/")
}

/**
 * Get current user's friend list (accepted)
 */
export async function getFriends() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await (supabase as any)
    .from("friends")
    .select(`
      id,
      status,
      user_id,
      friend_id,
      friend_profile:profiles!friend_id(id, name, avatar_url, email),
      user_profile:profiles!user_id(id, name, avatar_url, email)
    `)
    .eq("status", "accepted")
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

  if (error) {
    console.error("Error fetching friends:", error)
    return []
  }

  return data.map((r: any) => {
    const profile = r.user_id === user.id ? r.friend_profile : r.user_profile
    return {
      requestId: r.id,
      ...profile
    }
  })
}

/**
 * Get pending requests (Incoming & Outgoing)
 */
export async function getPendingRequests() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
  
    if (!user) return { incoming: [], outgoing: [] }
  
    const { data, error } = await (supabase as any)
      .from("friends")
      .select(`
        id,
        status,
        user_id,
        friend_id,
        friend_profile:profiles!friend_id(id, name, avatar_url, email),
        user_profile:profiles!user_id(id, name, avatar_url, email)
      `)
      .eq("status", "pending")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
  
    if (error) {
      console.error("Error fetching pending requests:", error)
      return { incoming: [], outgoing: [] }
    }
  
    const incoming = (data as any[])
        .filter((r: any) => r.friend_id === user.id)
        .map((r: any) => ({ requestId: r.id, ...r.user_profile }))

    const outgoing = (data as any[])
        .filter((r: any) => r.user_id === user.id)
        .map((r: any) => ({ requestId: r.id, ...r.friend_profile }))

    return { incoming, outgoing }
}
