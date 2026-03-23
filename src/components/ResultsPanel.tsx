import { CheckCircle2, AlertTriangle, XCircle, Package, ShoppingCart, Zap, Mail } from 'lucide-react'
import { useState } from 'react'
import type { ValidationResult, Component } from '../lib/types'

interface Props {
  result: ValidationResult
  components: Component[]
}

const categoryIcon = {
  Essential:   <ShoppingCart size={14} />,
  Recommended: <Zap size={14} />,
}
const categoryColor = {
  Essential:   'text-gray-700',
  Recommended: 'text-amber-600',
}

function ComponentCard({ c }: { c: Component }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="shrink-0 mt-0.5">
        {c.included
          ? <CheckCircle2 size={16} className="text-green-600" />
          : c.required
          ? <Package size={16} className="text-brand" />
          : <Zap size={16} className="text-amber-500" />
        }
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-gray-900 leading-tight">{c.name}</span>
          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
            c.included ? 'bg-green-100 text-green-700'
            : c.required ? 'bg-red-50 text-brand'
            : 'bg-amber-50 text-amber-600'
          }`}>
            {c.included ? 'Included' : c.required ? 'Required' : 'Recommended'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{c.reason}</p>
        {c.note && <p className="text-xs text-amber-600 mt-1">{c.note}</p>}
      </div>
    </div>
  )
}

export default function ResultsPanel({ result, components }: Props) {
  const [email, setEmail] = useState('')
  const [sent, setSent]   = useState(false)

  const { status, issues } = result
  const errors   = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')

  const cfg = {
    compatible: {
      wrap:     'bg-green-50 border-green-200',
      icon:     <CheckCircle2 size={36} className="text-green-600" />,
      badge:    'bg-green-100 text-green-700',
      label:    'Compatible',
      headline: 'Your room is ready for the CLM PRO.',
      sub:      'All dimensions meet or exceed the recommended specifications. You\'re cleared for purchase.',
    },
    conditional: {
      wrap:     'bg-amber-50 border-amber-200',
      icon:     <AlertTriangle size={36} className="text-amber-500" />,
      badge:    'bg-amber-100 text-amber-700',
      label:    'Compatible with adjustments',
      headline: 'Your room works — with a few things to note.',
      sub:      `${warnings.length} consideration${warnings.length !== 1 ? 's' : ''} identified. Review before purchasing.`,
    },
    incompatible: {
      wrap:     'bg-red-50 border-red-200',
      icon:     <XCircle size={36} className="text-red-500" />,
      badge:    'bg-red-100 text-brand',
      label:    'Not Compatible',
      headline: `${errors.length} requirement${errors.length !== 1 ? 's' : ''} not met.`,
      sub:      'Your room doesn\'t meet the minimum requirements for the CLM PRO.',
    },
  }[status]

  return (
    <div className="space-y-6">

      {/* Verdict */}
      <div className={`rounded-xl border p-6 ${cfg.wrap}`}>
        <div className="flex items-start gap-4">
          <div className="shrink-0">{cfg.icon}</div>
          <div className="flex-1">
            <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded ${cfg.badge}`}>
              {cfg.label}
            </span>
            <h2 className="text-xl font-black text-gray-900 mt-2 mb-1">{cfg.headline}</h2>
            <p className="text-sm text-gray-600">{cfg.sub}</p>
          </div>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            {errors.length > 0 ? 'Issues to Resolve' : 'Recommendations'}
          </h3>
          {[...errors, ...warnings].map((issue, i) => (
            <div key={i} className={`flex gap-3 p-3.5 rounded-lg border ${
              issue.severity === 'error' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="shrink-0 mt-0.5">
                {issue.severity === 'error'
                  ? <XCircle size={15} className="text-red-500" />
                  : <AlertTriangle size={15} className="text-amber-500" />
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{issue.message}</p>
                <p className="text-xs text-gray-500 mt-0.5">{issue.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Component checklist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">What You'll Need</h3>
          <span className="text-[10px] text-gray-400">
            {components.filter(c => !c.included).length} items to source
          </span>
        </div>
        {(['Essential', 'Recommended'] as const).map(cat => {
          const items = components.filter(c => c.category === cat)
          if (!items.length) return null
          return (
            <div key={cat} className="mb-4">
              <div className={`flex items-center gap-1.5 mb-2 ${categoryColor[cat]}`}>
                {categoryIcon[cat]}
                <span className="text-[11px] font-bold uppercase tracking-widest">{cat}</span>
              </div>
              <div className="space-y-2">
                {items.map((c, i) => <ComponentCard key={i} c={c} />)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Email + Shop CTA */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        {!sent ? (
          <form onSubmit={e => { e.preventDefault(); if (email) setSent(true) }} className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2.5 pl-8 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-brand"
              />
            </div>
            <button type="submit" className="shrink-0 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-sm font-semibold text-gray-700 px-4 py-2.5 rounded transition-colors">
              Save Results
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 size={15} /> Results saved — check your inbox.
          </div>
        )}
        <p className="text-[10px] text-gray-400">
          Get a PDF copy of your results and component list sent to your inbox.
        </p>

        {status !== 'incompatible' && (
          <a
            href="#"
            className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold text-sm uppercase tracking-wider py-3 px-6 rounded transition-colors w-full"
          >
            Shop CLM PRO →
          </a>
        )}
      </div>
    </div>
  )
}
