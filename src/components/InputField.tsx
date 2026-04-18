import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface InputFieldProps {
  icon: React.ReactNode
  type: string
  name: string
  placeholder: string
  value: string
  className?: string
  label?: string
  required?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function InputField({
  icon,
  type,
  name,
  placeholder,
  value,
  onChange,
  className,
  label,
  required,
}: InputFieldProps) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type
  const id = `field-${name}`

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-600 select-none cursor-pointer"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <label
        htmlFor={id}
        className={`flex items-center gap-2.5 px-3.5 h-12 w-full rounded-lg border bg-gray-50 cursor-text transition-all duration-150
          ${
            focused
              ? 'border-teal-600 bg-white ring-[2.5px] ring-teal-600/10'
              : 'border-gray-200 hover:border-gray-300'
          } ${className}`}
      >
        <span
          className={`transition-colors duration-150 shrink-0 ${focused ? 'text-teal-600' : 'text-gray-400'}`}
        >
          {icon}
        </span>

        <input
          id={id}
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault()
              setShowPassword((v) => !v)
            }}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-150 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </label>
    </div>
  )
}
