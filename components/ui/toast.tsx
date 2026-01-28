"use client"

import * as React from "react"

// Minimal Toast types used by tmp-v0/hooks/use-toast.ts.
// This is intentionally lightweight: the project currently only imports the
// types (ToastProps, ToastActionElement) for state management.

export type ToastActionElement = React.ReactElement

export type ToastVariant = "default" | "destructive"

export interface ToastProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: ToastVariant
}

