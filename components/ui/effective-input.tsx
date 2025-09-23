"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

interface EffectiveInputProps {
  label: string
  type?: string
  value: string
  onChange: (val: string) => void
  className?: string
}

export function EffectiveInput({
  label,
  type = "text",
  value,
  onChange,
  className,
}: EffectiveInputProps) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === "password"

  return (
    <div className={cn("relative w-full my-6", className)}>
      <input
        type={isPassword && showPassword ? "text" : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        className="peer bg-transparent border-0 border-b-2 border-white w-full py-3 text-lg text-white focus:outline-none focus:border-cyan-300 pr-10"
      />

      {/* Label hiệu ứng từng chữ */}
      <label className="absolute left-0 top-3 pointer-events-none flex gap-[1px]">
        {label.split("").map((char, i) => (
          <span
            key={i}
            style={{ transitionDelay: `${i * 50}ms` }}
            className={cn(
              "inline-block text-lg min-w-[5px] transition-transform duration-300",
              (focused || value)
                ? "text-cyan-300 -translate-y-7"
                : "text-white"
            )}
          >
            {char}
          </span>
        ))}
      </label>

      {/* Nút toggle password */}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-300"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  )
}
