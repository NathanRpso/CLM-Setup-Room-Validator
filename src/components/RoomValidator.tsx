import { useState, useEffect, useCallback } from 'react'
import { Pencil } from 'lucide-react'
import type { Measurements } from '../lib/types'
import type { UnitSystem } from './MeasurementForm'
import { validate, getComponents, isComplete } from '../lib/validation'
import MeasurementForm from './MeasurementForm'
import RoomDiagram from './RoomDiagram'
import ResultsPanel from './ResultsPanel'

const DEFAULTS: Measurements = {
  ceilingHeight:   10,
  roomDepth:       14,
  roomWidth:       14,
  ceilingMaterial: '',
}

function paramsToMeasurements(): Partial<Measurements> {
  const p = new URLSearchParams(window.location.search)
  const out: Partial<Measurements> = {}
  const ch = parseFloat(p.get('ch') ?? '')
  const rd = parseFloat(p.get('rd') ?? '')
  const rw = parseFloat(p.get('rw') ?? '')
  const cm = p.get('cm') as Measurements['ceilingMaterial'] | null
  if (!isNaN(ch)) out.ceilingHeight  = ch
  if (!isNaN(rd)) out.roomDepth      = rd
  if (!isNaN(rw)) out.roomWidth      = rw
  if (cm)         out.ceilingMaterial = cm
  return out
}


function fmtStat(ft: number, unit: UnitSystem) {
  return unit === 'metric' ? `${(ft * 0.3048).toFixed(1)} m` : `${ft.toFixed(1)} ft`
}

export default function RoomValidator() {
  const savedParams = paramsToMeasurements()
  const [values, setValues]         = useState<Measurements>({ ...DEFAULTS, ...savedParams })
  const [unit, setUnit]             = useState<UnitSystem>('imperial')
  const [showResults, setShowResults] = useState(false)
  const [flipped, setFlipped]       = useState(false)

  useEffect(() => {
    if (isComplete(values)) {
      window.history.replaceState(null, '', `?ch=${values.ceilingHeight}&rd=${values.roomDepth}&rw=${values.roomWidth}&cm=${values.ceilingMaterial}`)
    }
  }, [values])

  useEffect(() => {
    if (Object.keys(savedParams).length === 4 && isComplete({ ...DEFAULTS, ...savedParams })) {
      setShowResults(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheck   = useCallback(() => { if (isComplete(values)) setShowResults(true) }, [values])
  const handleRecheck = useCallback(() => {
    setShowResults(false)
    setTimeout(() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  const complete  = isComplete(values)
  const result    = complete ? validate(values, unit) : null
  const allComps  = complete ? getComponents(values, unit) : []
  const comps     = allComps.filter(c => c.category !== 'InBox')
  const inBox     = allComps.filter(c => c.category === 'InBox')

  return (
    <section id="validator" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">

      {/* Section header — title changes between form and results */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-8 bg-brand" />
          <span className="text-brand text-xs font-bold uppercase tracking-widest">Room Validator</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
            {showResults ? 'Compatibility Summary' : 'Enter your room dimensions'}
          </h2>
        </div>
        <p className="text-gray-400 mt-2 text-sm">
          {showResults
            ? 'Review your results below.'
            : 'Adjust the sliders or input your measurements.'}
        </p>
      </div>

      <div id="form-section">
        {!showResults ? (
          /* ── INPUT STATE ─────────────────────────────────────── */
          <div className="grid lg:grid-cols-[1fr_1.15fr] gap-8 items-start">

            {/* Form */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-8">
              <MeasurementForm
                values={values}
                onChange={setValues}
                unit={unit}
                onUnitChange={setUnit}
              />
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={handleCheck}
                  disabled={!complete}
                  className={`w-full py-4 font-bold text-sm uppercase tracking-widest rounded transition-all ${
                    complete
                      ? 'bg-brand hover:bg-brand-hover text-white cursor-pointer shadow-sm'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200'
                  }`}
                >
                  {complete ? 'Check My Room →' : 'Select ceiling material to continue'}
                </button>
              </div>
            </div>

            {/* Simplified 3D preview */}
            <div className="lg:sticky lg:top-[120px]">
              <RoomDiagram values={values} isComplete={complete} unit={unit} simplified flipped={flipped} onFlip={() => setFlipped(f => !f)} />
            </div>
          </div>

        ) : (
          /* ── RESULTS STATE ───────────────────────────────────── */
          <div className="space-y-8">

            {/* Top 2-col: visualiser + verdict */}
            <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8">

              {/* Left: visualiser + measurements */}
              <div className="lg:sticky lg:top-[120px] self-start space-y-3">
                <RoomDiagram values={values} isComplete={true} status={result?.status} unit={unit} flipped={flipped} onFlip={() => setFlipped(f => !f)} />

                {/* Measurements row with edit */}
                <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your Measurements</span>
                    <button
                      onClick={handleRecheck}
                      className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
                    >
                      <Pencil size={11} />
                      Edit
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    {[
                      ['Ceiling', fmtStat(values.ceilingHeight, unit)],
                      ['Depth',   fmtStat(values.roomDepth, unit)],
                      ['Width',   fmtStat(values.roomWidth, unit)],
                      ['Ceiling', values.ceilingMaterial || '—'],
                    ].map(([k, v]) => (
                      <div key={k + v} className="flex items-center gap-1.5">
                        <span className="text-[11px] text-gray-400">{k}</span>
                        <span className="text-[11px] font-semibold text-gray-900 capitalize">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: verdict + issues + save + shop — stretches to match left height */}
              <div className="flex flex-col">
                {result && <ResultsPanel result={result} />}
              </div>
            </div>

            {/* Below: What else you'll need — hidden when incompatible */}
            {comps.length > 0 && result?.status !== 'incompatible' && (
              <div className="space-y-8">

                {/* What else you'll need */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
                  <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">What Else You'll Need</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Source these separately before installation.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {comps.map((c, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-24 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-900 leading-tight">{c.name}</span>
                          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            c.required ? 'bg-red-50 text-brand' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {c.required ? 'Required' : 'Recommended'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-auto">
                          <p className="flex-1 text-xs text-gray-500 leading-relaxed line-clamp-2">{c.reason}</p>
                          {c.image && (
                            <div className="shrink-0 w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1">
                              <img src={`${import.meta.env.BASE_URL}${c.image?.replace(/^\//, '')}`} alt={c.name} className="w-full h-full object-contain opacity-60" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What's in the box */}
                {inBox.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
                    <div className="mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">What's in the Box</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">Everything included when you purchase the CLM PRO.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {inBox.map((c, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-24 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-900 leading-tight">{c.name}</span>
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                              Included
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-auto">
                            <p className="flex-1 text-xs text-gray-500 leading-relaxed line-clamp-2">{c.reason}</p>
                            {c.image && (
                              <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-2">
                                <img src={`${import.meta.env.BASE_URL}${c.image?.replace(/^\//, '')}`} alt={c.name} className="w-full h-full object-contain opacity-50" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Support nudge */}
                <div className="text-center py-2">
                  <span className="text-xs text-gray-400">Still have questions? </span>
                  <a href="#" className="text-xs font-semibold text-brand hover:text-brand-hover transition-colors">Contact support →</a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
