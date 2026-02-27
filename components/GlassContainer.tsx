'use client'

import { ReactNode } from 'react'

interface GlassContainerProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'card' | 'header' | 'sidebar'
}

export default function GlassContainer({ 
  children, 
  className = '', 
  variant = 'default' 
}: GlassContainerProps) {
  const baseClasses = 'relative overflow-hidden'
  
  const variantClasses = {
    default: 'bg-slate-800/40 backdrop-blur-xl border border-slate-600/30 rounded-lg shadow-lg shadow-black/10',
    card: 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-lg shadow-black/10 hover:border-slate-600/50 transition-colors duration-200',
    header: 'bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-black/10',
    sidebar: 'bg-slate-900/95 backdrop-blur-xl'
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {/* Subtle glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/2 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}