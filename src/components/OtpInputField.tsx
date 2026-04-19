'use client'

import { useEffect, useRef, useState } from 'react'

interface OtpInputProps {
  length?: number
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
}

const OTP_LENGTH_DEFAULT = 6

const OtpInputField = ({
  length = OTP_LENGTH_DEFAULT,
  onChange,
  onComplete,
}: OtpInputProps) => {
  const [otp, setOtp] = useState<string[]>(() =>
    Array.from({ length }, () => ''),
  )
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const isProgrammaticFocus = useRef(false)

  const value = otp.join('')

  useEffect(() => {
    onChange?.(value)
    if (value.length === length && otp.every((digit) => digit !== '')) {
      onComplete?.(value)
    }
  }, [length, onChange, onComplete, otp, value])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const focusIndex = (index: number) => {
    isProgrammaticFocus.current = true
    inputRefs.current[index]?.focus()
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!isProgrammaticFocus.current) {
      e.target.select()
    }
    isProgrammaticFocus.current = false
  }

  const setDigitAtIndex = (index: number, digit: string) => {
    setOtp((prev) => {
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

    // multi-digit paste via onChange (e.g. autofill)
    if (digits.length > 1) {
      setOtp((prev) => {
        const next = [...prev]
        const merged = digits.slice(0, length)
        for (let position = 0; position < merged.length; position += 1) {
          next[index + position] = merged[position]
        }
        return next
      })
      const nextFocusIndex = Math.min(index + digits.length, length - 1)
      focusIndex(nextFocusIndex)
      return
    }

    // ✅ single digit — always set & advance
    // (same-digit case is handled in handleKeyDown,
    //  but this still runs for different digits)
    setDigitAtIndex(index, digits)
    if (index < length - 1) {
      focusIndex(index + 1)
    }
  }

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // ✅ FIX: digit key pressed on an already-filled cell
    // onChange won't fire if the value is identical, so we handle it here
    if (/^\d$/.test(event.key) && otp[index] !== '') {
      event.preventDefault()
      setDigitAtIndex(index, event.key) // update (may be same or different digit)
      if (index < length - 1) {
        focusIndex(index + 1)
      }
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

  const handlePaste = (
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault()
    const pastedValue = event.clipboardData.getData('text').replace(/\D/g, '')

    if (!pastedValue) return

    setOtp((prev) => {
      const next = [...prev]
      pastedValue
        .slice(0, length - index)
        .split('')
        .forEach((digit, offset) => {
          next[index + offset] = digit
        })
      return next
    })

    const nextIndex = Math.min(index + pastedValue.length, length - 1)
    focusIndex(nextIndex)
  }

  return (
    <div className="flex items-center justify-center gap-3 xs:gap-4 sm:gap-6">
      {/* First group */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element
            }}
            value={otp[index]}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            onFocus={handleFocus}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            aria-label={`OTP digit ${index + 1}`}
            className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg border border-gray-200 bg-gray-50 text-center text-base sm:text-lg font-semibold tracking-widest text-gray-800 outline-none transition-all duration-150 focus:border-teal-600 focus:bg-white focus:ring-[2.5px] focus:ring-teal-600/10"
          />
        ))}
      </div>

      {/* Second group */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {Array.from({ length: 3 }).map((_, i) => {
          const index = i + 3
          return (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element
              }}
              value={otp[index]}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={(event) => handlePaste(index, event)}
              onFocus={handleFocus}
              inputMode="numeric"
              autoComplete="off"
              maxLength={1}
              aria-label={`OTP digit ${index + 1}`}
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg border border-gray-200 bg-gray-50 text-center text-base sm:text-lg font-semibold tracking-widest text-gray-800 outline-none transition-all duration-150 focus:border-teal-600 focus:bg-white focus:ring-[2.5px] focus:ring-teal-600/10"
            />
          )
        })}
      </div>
    </div>
  )
}

export default OtpInputField
