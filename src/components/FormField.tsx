'use client'

import { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
  error?: string
}

export function FormField({ label, required, hint, children, error }: FormFieldProps) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mb-2">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
}

export function Select({ value, onChange, options, placeholder }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}

export function TextInput({ value, onChange, placeholder, type = 'text' }: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
    />
  )
}

interface CheckboxGroupProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  maxSelect?: number
}

export function CheckboxGroup({ options, selected, onChange, maxSelect }: CheckboxGroupProps) {
  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option))
    } else {
      if (maxSelect && selected.length >= maxSelect) return
      onChange([...selected, option])
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option)
        const isDisabled = !isSelected && maxSelect !== undefined && selected.length >= maxSelect

        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            disabled={isDisabled}
            className={`
              flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-all border
              ${isSelected
                ? 'bg-brand-50 border-brand-400 text-brand-700 font-medium'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }
              ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span
              className={`
                w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all
                ${isSelected ? 'bg-brand-600 border-brand-600' : 'border-gray-300'}
              `}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            {option}
          </button>
        )
      })}
    </div>
  )
}

interface RadioGroupProps {
  options: string[]
  value: string
  onChange: (value: string) => void
}

export function RadioGroup({ options, value, onChange }: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-left transition-all border
            ${value === option
              ? 'bg-brand-50 border-brand-400 text-brand-700 font-medium'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          <span
            className={`
              w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
              ${value === option ? 'border-brand-600' : 'border-gray-300'}
            `}
          >
            {value === option && <span className="w-2 h-2 rounded-full bg-brand-600" />}
          </span>
          {option}
        </button>
      ))}
    </div>
  )
}
