import { linePoints, pathFrom } from "./lib"
import { cn } from "@/lib/utils"

/** A small trend line. Decorative: the number beside it carries the meaning. */
export function Sparkline({
  values,
  className,
  width = 120,
  height = 32,
}: {
  values: number[]
  className?: string
  width?: number
  height?: number
}) {
  const pts = linePoints(values, width, height, 3)
  const last = pts[pts.length - 1]
  const area = `${pathFrom(pts)} L${last[0]},${height} L${pts[0][0]},${height} Z`
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible text-pop-ink", className)}
      aria-hidden
    >
      <path d={area} fill="currentColor" opacity={0.08} />
      <path d={pathFrom(pts)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={3} fill="currentColor" stroke="var(--card)" strokeWidth={2} />
    </svg>
  )
}
