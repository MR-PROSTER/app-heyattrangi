"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface ExploreErrorBoundaryProps {
  children: ReactNode
  /** Optional fallback UI; defaults to calm recovery card */
  fallback?: ReactNode
  onReset?: () => void
  title?: string
  description?: string
}

interface ExploreErrorBoundaryState {
  hasError: boolean
}

/**
 * Catches render errors in Explore surfaces and offers a calm recovery path.
 */
export default class ExploreErrorBoundary extends Component<
  ExploreErrorBoundaryProps,
  ExploreErrorBoundaryState
> {
  state: ExploreErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ExploreErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ExploreErrorBoundary]", error, info.componentStack)
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          role="alert"
          className="rounded-[24px] border border-slate-100 bg-white px-6 py-12 text-center max-w-md mx-auto"
        >
          <h2 className="font-bold text-lg text-slate-800 tracking-tight mb-2">
            {this.props.title ?? "Something went wrong"}
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
            {this.props.description ??
              "We couldn't load this part of Explore. You can try again or return home."}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
