"use client"

import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion"

export function BoxAmbientBackdrop() {
  const reduced = usePrefersReducedMotion()
  if (reduced) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-testid="box-ambient"
    >
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--color-accent-breath) 8%, var(--color-canvas)) 0%, var(--color-canvas) 40%, color-mix(in srgb, var(--color-accent) 6%, var(--color-canvas)) 100%)",
          animation: "box-bg-shift 48s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -left-[20%] top-[10%] h-[55vmax] w-[55vmax] rounded-full opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent-breath), transparent 70%)",
          animation: "box-bg-drift 40s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-[15%] bottom-[5%] h-[45vmax] w-[45vmax] rounded-full opacity-[0.06]"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent), transparent 70%)",
          animation: "box-bg-drift 52s ease-in-out infinite reverse",
        }}
      />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-accent/20"
          style={{
            left: `${8 + i * 11}%`,
            top: `${15 + (i % 4) * 18}%`,
            animation: `box-particle-float ${12 + i * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes box-bg-shift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(8deg); }
        }
        @keyframes box-bg-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3%, 2%) scale(1.04); }
        }
        @keyframes box-particle-float {
          0%, 100% { transform: translateY(0); opacity: 0.15; }
          50% { transform: translateY(-14px); opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
