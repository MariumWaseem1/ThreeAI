'use client'

interface Step {
  label: string
  icon: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isActive = index === currentStep

        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300
                  ${isCompleted ? 'bg-brand-600 text-white' : ''}
                  ${isActive ? 'bg-brand-600 text-white ring-4 ring-brand-100' : ''}
                  ${!isCompleted && !isActive ? 'bg-gray-100 text-gray-400' : ''}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium hidden sm:block
                  ${isActive ? 'text-brand-600' : ''}
                  ${isCompleted ? 'text-brand-500' : ''}
                  ${!isCompleted && !isActive ? 'text-gray-400' : ''}
                `}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  h-0.5 w-12 sm:w-20 mx-1 mt-[-18px] sm:mt-[-20px] transition-all duration-500
                  ${isCompleted ? 'bg-brand-600' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
