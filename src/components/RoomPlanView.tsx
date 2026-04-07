import type { Measurements } from '../lib/types'
import type { UnitSystem } from './MeasurementForm'

interface Props {
  values: Measurements
  unit: UnitSystem
}

const SVG_W = 600
const SVG_H = 370
const PAD_L = 60, PAD_R = 32, PAD_T = 36, PAD_B = 60
const DW = SVG_W - PAD_L - PAD_R
const DH = SVG_H - PAD_T - PAD_B

export default function RoomPlanView({ values, unit }: Props) {
  const fmt = (ft: number) =>
    unit === 'metric' ? `${(ft * 0.3048).toFixed(1)} m` : `${ft.toFixed(1)} ft`

  const W = values.roomWidth
  const D = values.roomDepth

  // Scale to fill draw area while preserving aspect ratio
  const scale = Math.min(DW / Math.max(W, 8), DH / Math.max(D, 10)) * 0.85
  const rW = W * scale
  const rD = D * scale

  // Top-left of room rectangle, centred in draw area
  const rx = PAD_L + (DW - rW) / 2
  const ry = PAD_T + (DH - rD) / 2

  // Screen bar on back wall (top edge of rectangle), slightly inset
  const scrPad = rW / 6
  const scrX1  = rx + scrPad
  const scrX2  = rx + rW - scrPad

  // ── Dimension annotation helpers ─────────────────────────────────────────

  // Horizontal arrow below the room
  const WDimOff = 20
  const wAY = ry + rD + WDimOff

  // Vertical arrow to the left of the room
  const DDimOff = 20
  const dAX = rx - DDimOff

  function arrowTip(cx: number, cy: number, dx: number, dy: number, s = 5) {
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const ux = dx / len, uy = dy / len
    const nx = -uy, ny = ux
    return `M ${cx} ${cy} L ${cx - ux*s + nx*(s/2)} ${cy - uy*s + ny*(s/2)} L ${cx - ux*s - nx*(s/2)} ${cy - uy*s - ny*(s/2)} Z`
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Room Plan</span>
      </div>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <defs>
          {/* Subtle dot grid for floor */}
          <pattern id="planDots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="8" r="0.9" fill="#CCCCCC" opacity="0.6" />
          </pattern>
        </defs>

        {/* ── Room floor ───────────────────────────────────────────────── */}
        <rect x={rx} y={ry} width={rW} height={rD} fill="#F8F8F8" stroke="#D4D4D4" strokeWidth="1.5" />
        <rect x={rx + 1} y={ry + 1} width={rW - 2} height={rD - 2} fill="url(#planDots)" />

        {/* ── Screen on back wall ──────────────────────────────────────── */}
        {/* Back-wall label */}
        <text
          x={rx + rW / 2} y={ry - 10}
          fill="#BBBBBB" fontSize="8" fontFamily="Inter,sans-serif"
          textAnchor="middle" fontWeight="600" letterSpacing="1"
        >
          SCREEN WALL
        </text>

        {/* Screen bar */}
        <rect x={scrX1} y={ry - 4} width={scrX2 - scrX1} height={8} rx="2" fill="#CC1B32" opacity="0.75" />

        {/* Screen label inside room */}
        <text
          x={rx + rW / 2} y={ry + 16}
          fill="#CC1B32" fontSize="8" fontFamily="Inter,sans-serif"
          textAnchor="middle" opacity="0.6"
        >
          Screen
        </text>

        {/* ── WIDTH dimension (below room) ─────────────────────────────── */}
        <g opacity="0.7">
          {/* Extension lines */}
          <line x1={rx}      y1={ry + rD} x2={rx}      y2={wAY} stroke="#CCCCCC" strokeWidth="0.75" strokeDasharray="2,2" />
          <line x1={rx + rW} y1={ry + rD} x2={rx + rW} y2={wAY} stroke="#CCCCCC" strokeWidth="0.75" strokeDasharray="2,2" />
          {/* Dimension line */}
          <line x1={rx} y1={wAY} x2={rx + rW} y2={wAY} stroke="#999" strokeWidth="1" />
          {/* Arrow tips */}
          <path d={arrowTip(rx,      wAY, -(rW), 0)} fill="#999" />
          <path d={arrowTip(rx + rW, wAY,   rW,  0)} fill="#999" />
          {/* Label */}
          <text
            x={rx + rW / 2} y={wAY + 14}
            fill="#777" fontSize="10.5" fontFamily="Inter,sans-serif"
            fontWeight="700" textAnchor="middle"
          >
            {fmt(W)} wide
          </text>
        </g>

        {/* ── DEPTH dimension (left of room) ───────────────────────────── */}
        <g opacity="0.7">
          {/* Extension lines */}
          <line x1={rx} y1={ry}      x2={dAX} y2={ry}      stroke="#CCCCCC" strokeWidth="0.75" strokeDasharray="2,2" />
          <line x1={rx} y1={ry + rD} x2={dAX} y2={ry + rD} stroke="#CCCCCC" strokeWidth="0.75" strokeDasharray="2,2" />
          {/* Dimension line */}
          <line x1={dAX} y1={ry} x2={dAX} y2={ry + rD} stroke="#999" strokeWidth="1" />
          {/* Arrow tips */}
          <path d={arrowTip(dAX, ry,       0, -(rD))} fill="#999" />
          <path d={arrowTip(dAX, ry + rD,  0,    rD)} fill="#999" />
          {/* Label */}
          <text
            x={dAX - 8} y={ry + rD / 2}
            fill="#777" fontSize="10.5" fontFamily="Inter,sans-serif"
            fontWeight="700" textAnchor="middle"
            transform={`rotate(-90, ${dAX - 8}, ${ry + rD / 2})`}
          >
            {fmt(D)} deep
          </text>
        </g>
      </svg>
    </div>
  )
}
