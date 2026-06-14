import { ArrowLeft } from 'lucide-react'
import { PORTFOLIO_PROJECTS_URL } from '@/lib/config'

export default function BackToPortfolio({ className = '' }) {
  return (
    <a
      href={PORTFOLIO_PROJECTS_URL}
      className={`group inline-flex items-center gap-2 text-sm font-medium text-slate-400 no-underline transition-colors hover:text-indigo-300 ${className}`}
      aria-label="Return to portfolio"
    >
      <ArrowLeft
        className="h-4 w-4 text-slate-500 transition-all duration-200 group-hover:text-indigo-400 group-hover:-translate-x-0.5"
        strokeWidth={2.25}
        aria-hidden="true"
      />
      <span>Portfolio</span>
    </a>
  )
}
