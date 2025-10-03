"use client"
import React from "react"

type Props = { children: React.ReactNode }
type State = { hasError: boolean; message?: string }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError(err: any) { return { hasError: true, message: err?.message || "Error" } }
  componentDidCatch(error: any, info: any) { console.error("UI Error:", error, info) }
  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-sm text-red-600">Something went wrong. Please try again.</div>
    }
    return this.props.children
  }
}

export default ErrorBoundary