import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "success"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-slate-900 text-white hover:bg-slate-800": variant === "default",
            "border border-slate-200 hover:bg-slate-100": variant === "outline",
            "hover:bg-slate-100": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
            "bg-emerald-600 text-white hover:bg-emerald-700": variant === "success",
            "h-10 py-2 px-4": size === "default",
            "h-9 px-3": size === "sm",
            "h-11 px-8": size === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
