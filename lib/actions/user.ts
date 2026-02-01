"use server"

import { createClient } from "@/lib/supabase/server"

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. First, try to fetch the existing profile
  const { data: existingProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (existingProfile && !fetchError) {
    return existingProfile
  }

  // 2. If no profile exists, create it from OAuth metadata
  const profileData = {
    id: user.id,
    email: user.email!,
    name: user.user_metadata.full_name || user.user_metadata.name || user.email?.split("@")[0],
    avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture,
    updated_at: new Date().toISOString()
  }

  const { data: newProfile, error: insertError } = await supabase
    .from("profiles")
    .insert(profileData)
    .select("*")
    .single()

  if (insertError) {
    console.error("Error creating user profile:", insertError.message)
    return profileData
  }

  return newProfile
}

export async function updateNickname(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("profiles")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating nickname:", error.message)
    throw new Error("Failed to update nickname")
  }

  // No specific revalidatePath needed if we use router.refresh() or the data is fetched on layout
  // But let's be safe
  const { revalidatePath } = await import("next/cache")
  revalidatePath("/")
}
