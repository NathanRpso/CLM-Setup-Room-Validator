import { Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Measurements, CeilingMaterial } from '../lib/types'

export type UnitSystem = 'imperial' | 'metric'

interface Props {
  values: Measurements
  onChange: (values: Measurements) => void
  unit: UnitSystem
  onUnitChange: (unit: UnitSystem) => void
}

const ceilingMaterials: { value: CeilingMaterial; label: string; sub: string }[] = [
  { value: 'drywall',  label: 'Drywall',       sub: 'Standard stud framing' },
  { value: 'drop',     label: 'Drop Ceiling',   sub: 'Suspended tiles' },
  { value: 'concrete', label: 'Concrete',       sub: 'Masonry / block' },
  { value: 'wood',     label: 'Wood / Beam',    sub: 'Exposed timber' },
  { value: 'other',    label: 'Other',          sub: 'Unsure or unusual' },
]

// Unit conversion
const ftToM  = (ft: number) => Math.round(ft * 0.3048 * 10) / 10
const mToFt  = (m: number)  => Math.round(m  / 0.3048 * 10) / 10

function fieldStatus(value: number, hardMin: number, recommended: number): 'ok' | 'warn' | 'error' {
  if (value < hardMin) return 'error'
  if (value < recommended) return 'warn'
  return 'ok'
}

// ── Slider Field ──────────────────────────────────────────────────────────────
interface SliderProps {
  label: string
  hint: string
  /** display value (already converted to current unit) */
  displayValue: number
  /** slider min in display units */
  min: number
  /** slider max in display units */
  max: number
  step: number
  unitLabel: string
  status?: 'ok' | 'warn' | 'error'
  onChange: (displayVal: number) => void
}

function SliderField({ label, hint, displayValue, min, max, step, unitLabel, status, onChange }: SliderProps) {
  const [raw, setRaw]       = useState(() => displayValue.toFixed(1))
  const [focused, setFocused] = useState(false)

  // Sync text when value changes externally (slider drag or unit toggle)
  useEffect(() => {
    if (!focused) setRaw(displayValue.toFixed(1))
  }, [displayValue, focused])

  function commit(text: string) {
    const parsed = parseFloat(text)
    const next   = isNaN(parsed)
      ? displayValue
      : Math.round(Math.max(min, Math.min(max, parsed)) * 10) / 10
    setRaw(next.toFixed(1))
    onChange(next)
  }

  // Only allow: digits, at most one decimal point, at most 1 decimal place, max 5 chars
  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const t = e.target.value
    if (t !== '' && !/^\d{0,3}(\.\d?)?$/.test(t)) return
    setRaw(t)
  }

  const clamped = Math.max(min, Math.min(max, displayValue))
  const pct     = ((clamped - min) / (max - min)) * 100
  const atMin   = displayValue <= min
  const atMax   = displayValue >= max

  const fillColor =
    status === 'error' ? '#EF4444' :
    status === 'warn'  ? '#F59E0B' : '#CC1B32'

  const trackStyle = {
    background: `linear-gradient(to right, ${fillColor} ${pct}%, #E5E5E5 ${pct}%)`,
  }

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-semibold text-gray-800">{label}</label>
          <button title={hint} className="text-gray-300 hover:text-gray-500 transition-colors" tabIndex={-1}>
            <Info size={13} />
          </button>
        </div>

        {/* Value input */}
        <div className="flex items-center gap-1">
          {atMin && !focused && <span className="text-xs font-bold text-gray-400 select-none">&lt;</span>}
          {atMax && !focused && <span className="text-xs font-bold text-gray-400 select-none">&gt;</span>}
          <input
            type="text"
            inputMode="decimal"
            value={focused ? raw : displayValue.toFixed(1)}
            onFocus={() => { setFocused(true); setRaw(displayValue.toFixed(1)) }}
            onBlur={() => { setFocused(false); commit(raw) }}
            onKeyDown={e => { if (e.key === 'Enter') { commit(raw); (e.target as HTMLInputElement).blur() } }}
            onChange={handleTextChange}
            className="w-16 text-right bg-white border border-gray-200 rounded px-2 py-1 text-sm font-bold text-gray-900 focus:outline-none focus:border-brand"
          />
          <span className="text-gray-400 text-xs w-5 shrink-0">{unitLabel}</span>
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        style={trackStyle}
        onChange={e => onChange(parseFloat(e.target.value))}
      />

      {/* Range labels */}
      <div className="flex justify-between text-[10px] text-gray-400 select-none">
        <span>&lt; {min} {unitLabel}</span>
        <div className="flex items-center gap-2">
          {status === 'error' && <span className="text-red-500 font-semibold">Below minimum</span>}
          {status === 'warn'  && <span className="text-amber-500 font-semibold">Below recommended</span>}
          {status === 'ok'    && <span className="text-green-600 font-semibold">✓ Good</span>}
        </div>
        <span>&gt; {max} {unitLabel}</span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MeasurementForm({ values, onChange, unit, onUnitChange }: Props) {
  const isMetric = unit === 'metric'
  const mLabel   = isMetric ? 'm' : 'ft'

  // Convert ft value → display value, and display value → ft for storage
  const toDisplay = (ft: number)  => isMetric ? ftToM(ft)  : ft
  const toFeet    = (disp: number) => isMetric ? mToFt(disp) : disp

  // Helper to fire onChange with one field updated (input always in display units → store in ft)
  const set = (key: keyof Measurements, dispVal: number) =>
    onChange({ ...values, [key]: toFeet(dispVal) })

  // Slider configs: [hardMin, recommended, sliderMin, sliderMax, step]
  // expressed in the current display unit
  const cfg = {
    ceilingHeight:  isMetric
      ? { min: 2.4, max: 5.0, step: 0.1, hardMin: 2.7, rec: 3.0 }
      : { min: 7,   max: 16,  step: 0.1, hardMin: 9,   rec: 10  },
    roomDepth:      isMetric
      ? { min: 3.0, max: 8.5, step: 0.1, hardMin: 4.6, rec: 5.5 }
      : { min: 10,  max: 28,  step: 0.1, hardMin: 15,  rec: 18  },
    roomWidth:      isMetric
      ? { min: 2.4, max: 7.3, step: 0.1, hardMin: 3.7, rec: 4.3 }
      : { min: 8,   max: 24,  step: 0.1, hardMin: 12,  rec: 14  },
    screenDistance: isMetric
      ? { min: 1.8, max: 4.6, step: 0.1, hardMin: 1.8, rec: 2.4 }
      : { min: 6,   max: 15,  step: 0.1, hardMin: 6,   rec: 8   },
  }

  return (
    <div className="space-y-7">

      {/* Unit toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900 font-bold text-base">Room Dimensions</h3>
        <div className="flex rounded overflow-hidden border border-gray-200 text-xs font-bold">
          {(['imperial', 'metric'] as UnitSystem[]).map(u => (
            <button
              key={u}
              onClick={() => onUnitChange(u)}
              className={`px-3 py-1.5 capitalize tracking-wide transition-colors ${
                unit === u
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-400 hover:text-gray-700'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Ceiling Height */}
      <SliderField
        label="Ceiling Height"
        hint="Measure from the floor to the ceiling at the planned CLM mount point — not at the room edges."
        displayValue={toDisplay(values.ceilingHeight)}
        {...cfg.ceilingHeight}
        unitLabel={mLabel}
        onChange={v => set('ceilingHeight', v)}
        status={fieldStatus(values.ceilingHeight, 9, 10)}
      />

      {/* Room Depth */}
      <SliderField
        label="Room Depth"
        hint="Total depth of the room from back wall (behind screen) to front wall, in the direction of ball flight."
        displayValue={toDisplay(values.roomDepth)}
        {...cfg.roomDepth}
        unitLabel={mLabel}
        onChange={v => set('roomDepth', v)}
        status={fieldStatus(values.roomDepth, 15, 18)}
      />

      {/* Room Width */}
      <SliderField
        label="Room Width"
        hint="Full side-to-side width of the space — determines safe swing clearance."
        displayValue={toDisplay(values.roomWidth)}
        {...cfg.roomWidth}
        unitLabel={mLabel}
        onChange={v => set('roomWidth', v)}
        status={fieldStatus(values.roomWidth, 12, 14)}
      />

      {/* Screen Distance */}
      <SliderField
        label="Distance from Screen"
        hint="Distance from your screen or impact net to where the golfer stands to hit. This determines the CLM PRO mounting position on the ceiling."
        displayValue={toDisplay(values.screenDistance)}
        {...cfg.screenDistance}
        unitLabel={mLabel}
        onChange={v => set('screenDistance', v)}
        status={(() => {
          const s = fieldStatus(values.screenDistance, 6, 8)
          // Also flag if screen distance ≥ room depth
          if (values.screenDistance >= values.roomDepth) return 'error'
          return s
        })()}
      />

      {/* Ceiling Material */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-semibold text-gray-800">Ceiling Material</label>
          <button
            title="Ceiling material determines which mounting hardware is required."
            className="text-gray-300 hover:text-gray-500 transition-colors"
            tabIndex={-1}
          >
            <Info size={13} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ceilingMaterials.map(m => (
            <button
              key={m.value}
              onClick={() => onChange({ ...values, ceilingMaterial: m.value })}
              className={`text-left px-3 py-2.5 rounded border transition-all ${
                values.ceilingMaterial === m.value
                  ? 'border-brand bg-red-50 text-gray-900'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className="text-xs font-bold">{m.label}</div>
              <div className="text-[10px] opacity-60 mt-0.5">{m.sub}</div>
            </button>
          ))}
        </div>
        {values.ceilingMaterial === 'other' && (
          <p className="text-xs text-amber-600 mt-1">
            Contact support before purchasing to confirm compatibility.
          </p>
        )}
      </div>
    </div>
  )
}
