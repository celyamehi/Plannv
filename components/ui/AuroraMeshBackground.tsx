"use client"

import React from "react"

interface AuroraMeshBackgroundProps {
  variant?: "hero" | "steps" | "salons"
  showGrid?: boolean
  className?: string
  opacity?: string
}

export default function AuroraMeshBackground({
  variant = "hero",
  showGrid = true,
  className = "",
  opacity = "opacity-75"
}: AuroraMeshBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
    >
      {/* Aurora Ambient Container with Shimmer */}
      <div className={`absolute inset-0 w-full h-full animate-aurora-shimmer ${opacity}`}>
        {/* Aurora Blob 1: Warm Nude & Champagne Gold */}
        <div
          className={`absolute rounded-full filter blur-[110px] animate-aurora-1 ${
            variant === "hero"
              ? "w-[650px] h-[650px] -top-[15%] -right-[10%] bg-gradient-to-tr from-nude-400/50 via-warm-400/40 to-amber-300/40"
              : variant === "steps"
              ? "w-[550px] h-[550px] top-[10%] -left-[10%] bg-gradient-to-tr from-nude-300/45 via-rose-300/35 to-warm-300/40"
              : "w-[600px] h-[600px] -top-[10%] -left-[5%] bg-gradient-to-tr from-amber-300/40 via-nude-400/45 to-warm-400/35"
          }`}
        />

        {/* Aurora Blob 2: Rose Gold & Blush Pink */}
        <div
          className={`absolute rounded-full filter blur-[120px] animate-aurora-2 ${
            variant === "hero"
              ? "w-[750px] h-[750px] -bottom-[20%] -left-[15%] bg-gradient-to-br from-rose-300/45 via-nude-300/50 to-amber-200/35"
              : variant === "steps"
              ? "w-[650px] h-[650px] -bottom-[15%] -right-[10%] bg-gradient-to-br from-warm-300/40 via-nude-200/50 to-pink-200/35"
              : "w-[700px] h-[700px] -bottom-[15%] -right-[10%] bg-gradient-to-br from-rose-300/40 via-warm-300/45 to-amber-200/35"
          }`}
        />

        {/* Aurora Blob 3: Iridescent Silk / Soft Iris Shimmer */}
        <div
          className={`absolute rounded-full filter blur-[130px] animate-aurora-3 ${
            variant === "hero"
              ? "w-[500px] h-[500px] top-[25%] left-[20%] bg-gradient-to-r from-purple-200/25 via-pink-200/30 to-nude-300/40"
              : variant === "steps"
              ? "w-[450px] h-[450px] top-[30%] left-[35%] bg-gradient-to-r from-rose-200/30 via-warm-200/35 to-amber-200/25"
              : "w-[500px] h-[500px] top-[20%] right-[25%] bg-gradient-to-r from-nude-300/35 via-rose-200/30 to-warm-200/40"
          }`}
        />

        {/* Aurora Blob 4: Soft Warm Glow Center */}
        <div
          className={`absolute rounded-full filter blur-[100px] animate-aurora-4 ${
            variant === "hero"
              ? "w-[550px] h-[550px] bottom-[10%] right-[15%] bg-gradient-to-tl from-amber-300/35 via-warm-300/40 to-nude-200/45"
              : variant === "steps"
              ? "w-[400px] h-[400px] bottom-[20%] left-[10%] bg-gradient-to-tl from-amber-200/30 via-nude-200/40 to-rose-200/30"
              : "w-[450px] h-[450px] bottom-[10%] left-[30%] bg-gradient-to-tl from-warm-300/40 via-amber-200/35 to-nude-300/40"
          }`}
        />
      </div>

      {/* Optional luxury subtle mesh pattern overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 bg-[radial-gradient(#b08968_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.06] mix-blend-overlay"
        />
      )}

      {/* Soft Vignette Overlay to blend seamlessly with surrounding sections */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60 pointer-events-none" />
    </div>
  )
}
