export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      meetings: {
        Row: {
          id: string
          host_id: string
          title: string
          description: string | null
          location: string | null
          meeting_at: string
          status: Database["public"]["Enums"]["meeting_status"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          host_id: string
          title: string
          description?: string | null
          location?: string | null
          meeting_at: string
          status?: Database["public"]["Enums"]["meeting_status"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          host_id?: string
          title?: string
          description?: string | null
          location?: string | null
          meeting_at?: string
          status?: Database["public"]["Enums"]["meeting_status"]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_host_id_fkey"
            columns: ["host_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      participants: {
        Row: {
          meeting_id: string
          user_id: string
          status: Database["public"]["Enums"]["participation_status"]
          joined_at: string
        }
        Insert: {
          meeting_id: string
          user_id: string
          status?: Database["public"]["Enums"]["participation_status"]
          joined_at?: string
        }
        Update: {
          meeting_id?: string
          user_id?: string
          status?: Database["public"]["Enums"]["participation_status"]
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_meeting_id_fkey"
            columns: ["meeting_id"]
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      personal_tasks: {
        Row: {
          id: string
          user_id: string
          content: string
          due_date: string
          is_public: boolean | null
          is_completed: boolean | null
          source: Database["public"]["Enums"]["task_source"]
          meeting_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          due_date: string
          is_public?: boolean | null
          is_completed?: boolean | null
          source?: Database["public"]["Enums"]["task_source"]
          meeting_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          due_date?: string
          is_public?: boolean | null
          is_completed?: boolean | null
          source?: Database["public"]["Enums"]["task_source"]
          meeting_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_tasks_meeting_id_fkey"
            columns: ["meeting_id"]
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_tasks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      meeting_status: "recruiting" | "confirmed" | "completed" | "cancelled"
      participation_status: "joined" | "cancelled"
      task_source: "personal" | "meeting"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
