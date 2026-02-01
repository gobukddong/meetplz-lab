"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { RealtimePresenceState } from "@supabase/supabase-js"

interface PresenceUser {
  id: string
  name: string
  avatar_url: string
  online_at: string
}

interface PresenceContextType {
  onlineUsers: Record<string, PresenceUser>
}

const PresenceContext = createContext<PresenceContextType>({
  onlineUsers: {},
})

export const usePresence = () => useContext(PresenceContext)

interface PresenceProviderProps {
  children: ReactNode
  user: any
}

export function PresenceProvider({ children, user }: PresenceProviderProps) {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, PresenceUser>>({})
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setOnlineUsers({})
      return
    }

    const channel = supabase.channel("global_presence", {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as RealtimePresenceState<PresenceUser>
        const transformed: Record<string, PresenceUser> = {}
        
        Object.keys(state).forEach((key) => {
          // Supabase Presence returns an array for each key (multi-session)
          // We just take the first one
          if (state[key] && state[key].length > 0) {
            transformed[key] = state[key][0]
          }
        })
        
        setOnlineUsers(transformed)
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("join", key, newPresences)
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("leave", key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: user.id,
            name: user.name || "사용자",
            avatar_url: user.avatar_url,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [user, supabase])

  return (
    <PresenceContext.Provider value={{ onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  )
}
