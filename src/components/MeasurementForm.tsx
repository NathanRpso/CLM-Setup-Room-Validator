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
  onChange: (displayVal: number) => void
}

function SliderField({ label, hint, displayValue, min, max, step, unitLabel, onChange }: SliderProps) {
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

  const fillColor = '#6B7280'

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

  // Slider ranges centred on the default value: max = 2×default − min
  // Imperial defaults: ceiling=10ft, depth=14ft, width=14ft
  // Metric defaults:   ceiling≈3.0m, depth≈4.3m, width≈4.3m
  const cfg = {
    ceilingHeight:  isMetric ? { min: 2.1, max: 3.9, step: 0.1 } : { min: 7,  max: 13, step: 0.1 },
    roomDepth:      isMetric ? { min: 3.0, max: 5.6, step: 0.1 } : { min: 10, max: 18, step: 0.5 },
    roomWidth:      isMetric ? { min: 2.0, max: 6.6, step: 0.1 } : { min: 8,  max: 20, step: 0.5 },
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
        hint="Measure from the floor to the ceiling at the centre of the room, directly above where you'll be hitting. Avoid measuring at the walls where the ceiling may be lower."
        displayValue={toDisplay(values.ceilingHeight)}
        {...cfg.ceilingHeight}
        unitLabel={mLabel}
        onChange={v => set('ceilingHeight', v)}
      />

      {/* Room Depth */}
      <SliderField
        label="Room Depth"
        hint="Measure the full length of the room in the direction you'll be hitting — from the wall where your screen will hang to the wall behind you."
        displayValue={toDisplay(values.roomDepth)}
        {...cfg.roomDepth}
        unitLabel={mLabel}
        onChange={v => set('roomDepth', v)}
      />

      {/* Room Width */}
      <SliderField
        label="Room Width"
        hint="Measure the full width of the room from side wall to side wall, perpendicular to your swing direction. This determines how much clearance you'll have on either side during a full swing."
        displayValue={toDisplay(values.roomWidth)}
        {...cfg.roomWidth}
        unitLabel={mLabel}
        onChange={v => set('roomWidth', v)}
      />

      {/* Ceiling Material */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-semibold text-gray-800">Ceiling Material</label>
          <button
            title="Select what your ceiling is made of. This determines which mounting hardware you'll need — some materials require additional anchor kits not included with the CLM PRO."
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
