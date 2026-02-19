"use client"

import type { PropsWithChildren } from "react"

export default function Prose({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={[
        "prose prose-slate dark:prose-invert",
        "max-w-3xl md:max-w-4xl mx-auto",
        "leading-relaxed",
        "text-base md:text-lg text-gray-700 dark:text-gray-300",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  )
}
