'use client'

import { useEffect, useRef, useState } from 'react'

interface OtpInputProps {
  length?: number
  autoFocus?: boolean
  disabled?: boolean
  error?: boolean
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
}

const OTP_LENGTH_DEFAULT = 6

const OtpInputField = ({
  length = OTP_LENGTH_DEFAULT,
  autoFocus = true,
  disabled = false,
  error = false,
  value: externalValue,
  onChange,
  onComplete,
}: OtpInputProps) => {
  const [internalOtp, setInternalOtp] = useState<string[]>(() =>
    Array.from({ length }, () => ''),
  )
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const isProgrammaticFocus = useRef(false)

  const otp =
    externalValue !== undefined
      ? Array.from(
          { length },
          (_, i) => externalValue.replace(/\D/g, '')[i] ?? '',
        )
      : internalOtp

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus()
  }, [autoFocus])

  const focusIndex = (index: number) => {
    isProgrammaticFocus.current = true
    inputRefs.current[index]?.focus()
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!isProgrammaticFocus.current) e.target.select()
    isProgrammaticFocus.current = false
  }

  const emitOtp = (nextOtp: string[]) => {
    const nextValue = nextOtp.join('')
    onChange?.(nextValue)
    if (nextValue.length === length && nextOtp.every((d) => d !== '')) {
      onComplete?.(nextValue)
    }
  }

  const commitOtp = (updater: (prev: string[]) => string[]) => {
    const nextOtp = updater([...otp])
    if (externalValue === undefined) {
      setInternalOtp(nextOtp)
    }
    emitOtp(nextOtp)
  }

  const setDigitAtIndex = (index: number, digit: string) => {
    commitOtp((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
  }

  const handleChange = (index: number, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '')

    if (!digits) {
      setDigitAtIndex(index, '')
      return
    }

    if (digits.length > 1) {
      commitOtp((prev) => {
        const next = [...prev]
        digits
          .slice(0, length)
          .split('')
          .forEach((d, i) => {
            if (index + i < length) next[index + i] = d
          })
        return next
      })
      focusIndex(Math.min(index + digits.length, length - 1))
      return
    }

    setDigitAtIndex(index, digits)
    if (index < length - 1) focusIndex(index + 1)
  }

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (/^\d$/.test(event.key) && otp[index] !== '') {
      event.preventDefault()
      setDigitAtIndex(index, event.key)
      if (index < length - 1) focusIndex(index + 1)
      return
    }

    if (event.key === 'Backspace') {
      event.preventDefault()
      if (otp[index]) {
        setDigitAtIndex(index, '')
        return
      }
      if (index > 0) {
        setDigitAtIndex(index - 1, '')
        focusIndex(index - 1)
      }
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusIndex(index - 1)
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault()
      focusIndex(index + 1)
    }
  }

  const handleBeforeInput = (
    index: number,
    event: React.FormEvent<HTMLInputElement> & { data?: string | null },
  ) => {
    const char = event.data ?? ''
    if (!/^\d$/.test(char)) return

    event.preventDefault()
    setDigitAtIndex(index, char)
    if (index < length - 1) focusIndex(index + 1)
  }

  const handlePaste = (
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault()
    const pastedValue = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pastedValue) return

    commitOtp((prev) => {
      const next = [...prev]
      pastedValue
        .slice(0, length - index)
        .split('')
        .forEach((d, i) => {
          next[index + i] = d
        })
      return next
    })
    focusIndex(Math.min(index + pastedValue.length, length - 1))
  }

  const groupSize = 3
  const groups: number[][] = []
  for (let i = 0; i < length; i += groupSize) {
    groups.push(
      Array.from({ length: Math.min(groupSize, length - i) }, (_, j) => i + j),
    )
  }

  const inputClass = [
    'h-11 w-11 sm:h-12 sm:w-12 rounded-lg border bg-gray-50 text-center',
    'text-base sm:text-lg font-semibold tracking-widest outline-none',
    'transition-all duration-150',
    error
      ? 'border-red-400 text-red-600 focus:border-red-500 focus:ring-[2.5px] focus:ring-red-500/10'
      : 'border-gray-200 text-gray-800 focus:border-teal-600 focus:bg-white focus:ring-[2.5px] focus:ring-teal-600/10',
    disabled ? 'cursor-not-allowed opacity-50 bg-gray-100' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="flex items-center justify-center gap-3 xs:gap-4 sm:gap-6">
      {groups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="grid gap-2 sm:gap-3"
          style={{
            gridTemplateColumns: `repeat(${group.length}, minmax(0, 1fr))`,
          }}
        >
          {group.map((index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              value={otp[index]}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              disabled={disabled}
              aria-label={`OTP digit ${index + 1}`}
              aria-invalid={error}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onBeforeInput={(e) =>
                handleBeforeInput(
                  index,
                  e as React.FormEvent<HTMLInputElement> & {
                    data?: string | null
                  },
                )
              }
              onPaste={(e) => handlePaste(index, e)}
              onFocus={handleFocus}
              className={inputClass}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default OtpInputField
