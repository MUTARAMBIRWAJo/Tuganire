"use client"

import * as React from "react"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmMessage?: string
}

export function ConfirmButton({ confirmMessage = "Are you sure?", onClick, ...rest }: Props) {
  return (
    <button
      {...rest}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
        onClick?.(e)
      }}
    />
  )
}
