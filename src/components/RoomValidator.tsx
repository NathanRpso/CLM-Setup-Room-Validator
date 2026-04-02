import { useState, useEffect, useCallback } from 'react'
import { Pencil } from 'lucide-react'
import type { Measurements } from '../lib/types'
import type { UnitSystem } from './MeasurementForm'
import { validate, getComponents, isComplete } from '../lib/validation'
import MeasurementForm from './MeasurementForm'
import RoomDiagram from './RoomDiagram'
import ResultsPanel from './ResultsPanel'

const DEFAULTS: Measurements = {
  ceilingHeight:  10,
  roomDepth:      14,
  roomWidth:      14,
  screenDistance: 10,
  ceilingMaterial: '',
}

function paramsToMeasurements(): Partial<Measurements> {
  const p = new URLSearchParams(window.location.search)
  const out: Partial<Measurements> = {}
  const ch = parseFloat(p.get('ch') ?? '')
  const rd = parseFloat(p.get('rd') ?? '')
  const rw = parseFloat(p.get('rw') ?? '')
  const sd = parseFloat(p.get('sd') ?? '')
  const cm = p.get('cm') as Measurements['ceilingMaterial'] | null
  if (!isNaN(ch)) out.ceilingHeight  = ch
  if (!isNaN(rd)) out.roomDepth      = rd
  if (!isNaN(rw)) out.roomWidth      = rw
  if (!isNaN(sd)) out.screenDistance = sd
  if (cm)         out.ceilingMaterial = cm
  return out
}

function LiveBadge({ values }: { values: Measurements }) {
  if (!isComplete(values)) return null
  const r = validate(values)
  const cfg = {
    compatible:   { label: 'Compatible',     cls: 'text-green-700 bg-green-100 border-green-200' },
    conditional:  { label: 'Check issues',   cls: 'text-amber-700 bg-amber-100 border-amber-200' },
    incompatible: { label: 'Not compatible', cls: 'text-red-700   bg-red-100   border-red-200'   },
  }
  const c = cfg[r.status]
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${c.cls}`}>
      {c.label}
    </span>
  )
}

type StatColor = 'green' | 'amber' | 'red'
const statColorCls: Record<StatColor, string> = {
  green: 'text-green-600',
  amber: 'text-amber-500',
  red:   'text-red-500',
}

// Values stored in ft. Thresholds: 2.7m=8.86ft, 3.2m=10.5ft, 4.2m=13.78ft, 5.0m=16.4ft, 3.0m=9.84ft
const STAT_LABELS: { key: keyof Measurements; label: string; color: (v: number) => StatColor }[] = [
  { key: 'ceilingHeight',  label: 'Ceiling Height',  color: v => v < 8.86 ? 'red' : v <= 10.5 ? 'green' : 'amber' },
  { key: 'roomDepth',      label: 'Room Depth',       color: v => v < 13.78 ? 'red' : v < 16.4 ? 'amber' : 'green' },
  { key: 'roomWidth',      label: 'Room Width',       color: v => v < 9.84 ? 'red' : v < 13.78 ? 'amber' : 'green' },
  { key: 'screenDistance', label: 'Screen Distance',  color: v => v < 6 ? 'red' : v < 8 ? 'amber' : 'green' },
]

function fmtStat(ft: number, unit: UnitSystem) {
  return unit === 'metric' ? `${(ft * 0.3048).toFixed(1)} m` : `${ft.toFixed(1)} ft`
}

export default function RoomValidator() {
  const savedParams = paramsToMeasurements()
  const [values, setValues]         = useState<Measurements>({ ...DEFAULTS, ...savedParams })
  const [unit, setUnit]             = useState<UnitSystem>('imperial')
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (isComplete(values)) {
      window.history.replaceState(null, '', `?ch=${values.ceilingHeight}&rd=${values.roomDepth}&rw=${values.roomWidth}&sd=${values.screenDistance}&cm=${values.ceilingMaterial}`)
    }
  }, [values])

  useEffect(() => {
    if (Object.keys(savedParams).length === 5 && isComplete({ ...DEFAULTS, ...savedParams })) {
      setShowResults(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheck   = useCallback(() => { if (isComplete(values)) setShowResults(true) }, [values])
  const handleRecheck = useCallback(() => {
    setShowResults(false)
    setTimeout(() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  const complete = isComplete(values)
  const result   = complete ? validate(values) : null
  const comps    = complete ? getComponents(values) : []

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
            {showResults ? 'Room Compatibility Summary' : 'Enter your room dimensions'}
          </h2>
          {!showResults && <LiveBadge values={values} />}
        </div>
        <p className="text-gray-400 mt-2 text-sm">
          {showResults
            ? 'Review your results and complete component list below.'
            : 'Adjust the sliders to match your space. The 3D diagram updates live.'}
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

            {/* Diagram */}
            <div className="lg:sticky lg:top-[120px]">
              <RoomDiagram values={values} isComplete={complete} status={result?.status} unit={unit} />

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {STAT_LABELS.map(s => {
                  const v = values[s.key] as number
                  return (
                    <div key={s.key} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                      <span className="text-xs text-gray-400">{s.label}</span>
                      <span className={`text-xs font-bold ${statColorCls[s.color(v)]}`}>
                        {fmtStat(v, unit)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        ) : (
          /* ── RESULTS STATE ───────────────────────────────────── */
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 items-start">

            {/* Left: diagram + measurements summary with back button */}
            <div className="lg:sticky lg:top-[120px] space-y-4">
              <RoomDiagram values={values} isComplete={true} status={result?.status} unit={unit} />

              {/* Measurement summary card with edit button */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Your Measurements
                  </div>
                  <button
                    onClick={handleRecheck}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
                  >
                    <Pencil size={11} />
                    Edit measurements
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    ['Ceiling Height',   fmtStat(values.ceilingHeight, unit)],
                    ['Room Depth',       fmtStat(values.roomDepth, unit)],
                    ['Room Width',       fmtStat(values.roomWidth, unit)],
                    ['Screen Distance',  fmtStat(values.screenDistance, unit)],
                    ['Ceiling Material', values.ceilingMaterial || '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{k}</span>
                      <span className="text-xs font-semibold text-gray-900 capitalize">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: results panel */}
            <div>
              {result && (
                <ResultsPanel result={result} components={comps} />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
