"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface ProfileErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
  title?: string
  description?: string
}

interface ProfileErrorBoundaryState {
  hasError: boolean
}

/**
 * Catches render errors in Profile surfaces and offers a calm recovery path.
 */
export default class ProfileErrorBoundary extends Component<
  ProfileErrorBoundaryProps,
  ProfileErrorBoundaryState
> {
  state: ProfileErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ProfileErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ProfileErrorBoundary]", error, info.componentStack)
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
          className="rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center max-w-md mx-auto shadow-sm"
        >
          <h2 className="font-bold text-lg text-gray-900 tracking-tight mb-2">
            {this.props.title ?? "Something went wrong"}
          </h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
            {this.props.description ??
              "We couldn't load this part of your profile. You can try again."}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-sm px-5 py-2.5
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
