import * as React from "react"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface DialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-50 w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  )
}

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children }) => {
  return <>{children}</>
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {children}
    </div>
  )
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className = '' }) => {
  return (
    <h2 className={`text-lg font-semibold ${className}`}>
      {children}
    </h2>
  )
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } 