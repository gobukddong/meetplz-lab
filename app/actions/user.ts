"use server"

import { createClient } from "@/lib/supabase/server"

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const profileData = {
    id: user.id,
    email: user.email!,
    name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split("@")[0],
    avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture,
    updated_at: new Date().toISOString()
  }

  // Use upsert with explicit onConflict and handle the result carefully
  const { data: profile, error: upsertError } = await supabase
    .from("profiles")
    .upsert(profileData) // By default uses the primary key for conflict resolution
    .select("*")
    .single()

  if (upsertError) {
    console.error("Error ensuring user profile:", upsertError.message)
    // Return mock if it failed but we have data, to prevent app crash
    return profileData
  }

  return profile
}
