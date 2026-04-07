import { CheckCircle2, AlertTriangle, XCircle, Mail, MessageCircle, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import type { ValidationResult } from '../lib/types'

interface Props {
  result: ValidationResult
}

export default function ResultsPanel({ result }: Props) {
  const [email, setEmail] = useState('')
  const [sent, setSent]   = useState(false)

  const { status, issues } = result
  const errors   = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  if (status === 'incompatible') {
    return (
      <div className="flex flex-col h-full gap-4 min-h-0">

        {/* Hero incompatible card */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 flex-1">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-red-100">
                <XCircle size={24} className="text-red-500" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-100 text-brand">
                Not Compatible
              </span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2">
              Your room won't work for the CLM PRO.
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {errors.length} critical requirement{errors.length !== 1 ? 's' : ''} not met. Review the details below — adjusting your space or choosing a different product may resolve this.
            </p>

            {/* Error tiles */}
            <div className="space-y-2 mb-6">
              {errors.map((issue, i) => (
                <div key={i} className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden flex">
                  <div className="w-1 shrink-0 bg-red-400" />
                  <div className="flex items-start gap-3 px-4 py-3.5 flex-1">
                    <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-snug">{issue.message}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{issue.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="space-y-2 mt-auto">
              <a href="#" className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold text-sm uppercase tracking-wider py-3 px-6 rounded-lg transition-colors w-full">
                <ShoppingCart size={15} />
                Shop MLM2PRO Instead
              </a>
              <a href="#" className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm uppercase tracking-wider py-3 px-6 rounded-lg border border-gray-200 transition-colors w-full">
                <MessageCircle size={15} />
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const cfg = {
    compatible: {
      border:   'border-green-200',
      bg:       'bg-green-50',
      iconBg:   'bg-green-100',
      icon:     <CheckCircle2 size={20} className="text-green-600" />,
      badge:    'bg-green-100 text-green-700',
      label:    'Compatible',
      headline: 'Your room is ready.',
      sub:      'All dimensions meet the recommended specs. You\'re cleared for purchase.',
    },
    conditional: {
      border:   'border-amber-200',
      bg:       'bg-amber-50',
      iconBg:   'bg-amber-100',
      icon:     <AlertTriangle size={20} className="text-amber-500" />,
      badge:    'bg-amber-100 text-amber-700',
      label:    'Compatible with adjustments',
      headline: `${warnings.length} thing${warnings.length !== 1 ? 's' : ''} to note before you buy.`,
      sub:      'Your room works — review the details below before purchasing.',
    },
  }[status]

  const hasUnverifiedCeiling = issues.some(i => i.field === 'ceilingMaterial' && i.severity === 'warning' && i.message.includes('unverified'))

  return (
    <div className="flex flex-col h-full gap-4 min-h-0">

      {/* Verdict card */}
      <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-5`}>
        <div className="flex items-start gap-3">
          <div className={`shrink-0 p-2 rounded-lg ${cfg.iconBg}`}>
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 ${cfg.badge}`}>
              {cfg.label}
            </span>
            <h2 className="text-lg font-black text-gray-900 leading-snug mb-1">{cfg.headline}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{cfg.sub}</p>
          </div>
        </div>
      </div>

      {/* Details — scrollable */}
      {issues.length > 0 && (
        <div className="flex flex-col min-h-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Details</p>
          <div className="overflow-y-auto space-y-2 min-h-0 pr-0.5">
            {[...errors, ...warnings].map((issue, i) => (
              <div key={i} className={`bg-white rounded-xl border shadow-sm overflow-hidden flex ${
                issue.severity === 'error' ? 'border-red-200' : 'border-amber-200'
              }`}>
                <div className={`w-1 shrink-0 ${issue.severity === 'error' ? 'bg-red-400' : 'bg-amber-400'}`} />
                <div className="flex items-start gap-3 px-4 py-3.5 flex-1">
                  <div className="shrink-0 mt-0.5">
                    {issue.severity === 'error'
                      ? <XCircle size={14} className="text-red-400" />
                      : <AlertTriangle size={14} className="text-amber-400" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-snug">{issue.message}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{issue.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email + Shop CTA */}
      <div className="mt-auto rounded-xl border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
        {!sent ? (
          <form onSubmit={e => { e.preventDefault(); if (email) setSent(true) }} className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 pl-8 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-brand"
              />
            </div>
            <button type="submit" className="shrink-0 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors">
              Save Results
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600 py-1">
            <CheckCircle2 size={14} /> Results saved — check your inbox.
          </div>
        )}
        <p className="text-[10px] text-gray-400">
          Get a PDF copy of your results and component list sent to your inbox.
        </p>
        {hasUnverifiedCeiling ? (
          <a href="#" className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-bold text-sm uppercase tracking-wider py-3 px-6 rounded-lg transition-colors w-full">
            <MessageCircle size={15} />
            Contact Support
          </a>
        ) : (
          <a href="#" className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold text-sm uppercase tracking-wider py-3 px-6 rounded-lg transition-colors w-full">
            Shop CLM PRO →
          </a>
        )}
      </div>
    </div>
  )
}
