import type { Measurements } from '../lib/types'
import type { UnitSystem } from './MeasurementForm'

interface Props {
  values: Measurements
  isComplete: boolean
  status?: 'compatible' | 'conditional' | 'incompatible'
  unit?: UnitSystem
}

const SVG_W = 600
const SVG_H = 370
const PL = 52, PR = 40, PT = 44, PB = 48
const DW = SVG_W - PL - PR
const DH = SVG_H - PT - PB

const RAD30 = 30 * Math.PI / 180
const COS   = Math.cos(RAD30)
const SIN   = Math.sin(RAD30)
const MIN_H = 9  // ft

const FACE = {
  back:    '#F5F5F5',
  left:    '#EEEEEE',
  floor:   '#E6E6E6',
  ceiling: '#F9F9F9',
  edge:    '#CCCCCC',
}

export default function RoomDiagram({ values, isComplete, status, unit = 'imperial' }: Props) {
  const fmtLen = (ft: number) =>
    unit === 'metric' ? `${(ft * 0.3048).toFixed(1)} m` : `${ft.toFixed(1)} ft`
  const W  = values.roomWidth
  const H  = values.ceilingHeight
  const D  = values.roomDepth
  // Clamp screen distance so it always fits inside the room
  const SD = Math.min(values.screenDistance, D * 0.92)

  // ── Scale ──────────────────────────────────────────────────────────────────
  const scale = Math.min(
    DW / (Math.max(W, 12) + Math.max(D, 15) * COS),
    DH / (Math.max(H, 9)  + Math.max(D, 15) * SIN),
  ) * 0.88

  const rW = W * scale, rH = H * scale, rD = D * scale
  const totalW = rW + rD * COS, totalH = rH + rD * SIN
  const ox = PL + (DW - totalW) / 2
  const oy = PT + (DH - totalH) / 2 + rH

  // 3-D → 2-D: origin = back-left-floor, Z increases toward viewer
  const p = (x: number, y: number, z: number) => ({
    x: ox + x * scale + z * COS * scale,
    y: oy - y * scale + z * SIN * scale,
  })
  const pts = (...cs: [number, number, number][]) =>
    cs.map(([x, y, z]) => { const q = p(x, y, z); return `${q.x},${q.y}` }).join(' ')

  type Pt = [number, number, number]

  // ── Room corners ───────────────────────────────────────────────────────────
  const BLF: Pt = [0, 0, 0],  BRF: Pt = [W, 0, 0]
  const BLC: Pt = [0, H, 0],  BRC: Pt = [W, H, 0]
  const FLF: Pt = [0, 0, D],  FRF: Pt = [W, 0, D]
  const FLC: Pt = [0, H, D],  FRC: Pt = [W, H, D]

  // ── Screen (suggested area, always contained within room dimensions) ─────────
  // Enforces 16:9 aspect ratio. Width-driven first, then height-clamped.
  const ASPECT   = 16 / 9
  const maxScrW  = Math.min(W * 0.82, W - 0.35)
  const maxScrH  = Math.min(H * 0.82, H - 0.25)
  let scrW = maxScrW
  let scrH = scrW / ASPECT
  if (scrH > maxScrH) { scrH = maxScrH; scrW = Math.min(scrH * ASPECT, maxScrW) }
  const scrX0  = (W - scrW) / 2
  const scrX1  = scrX0 + scrW

  // ── CLM: mounted at ceiling, centered width, above hitting position ─────────
  // Hitting position is SD feet from the screen (back wall), so Z = SD from back
  const clmZ = SD
  const CLM: Pt = [W / 2, H, clmZ]

  // Hitting position (on floor, directly below CLM)
  const HIT: Pt = [W / 2, 0, clmZ]

  // Detection zone on floor (±1.8ft square around hit position)
  const dz = 1.8
  const DZ = {
    BL: [W/2-dz, 0, clmZ-dz] as Pt,
    BR: [W/2+dz, 0, clmZ-dz] as Pt,
    FR: [W/2+dz, 0, clmZ+dz] as Pt,
    FL: [W/2-dz, 0, clmZ+dz] as Pt,
  }

  // ── Ball flight arc (cubic bezier through 3-D space) ─────────────────────
  const arcS  = p(W/2, 0.3,         clmZ)
  const arcC1 = p(W/2, H * 0.38,    SD * 0.5)
  const arcC2 = p(W/2, scrH * 0.75, SD * 0.08)
  const arcE  = p(W/2, scrH * 0.42, 0.06)

  // ── CLM device geometry ───────────────────────────────────────────────────
  const cd = 0.22, ch = 0.14
  const clm = {
    BLt: p(W/2-cd, H,    clmZ-cd), BRt: p(W/2+cd, H,    clmZ-cd),
    BLb: p(W/2-cd, H-ch, clmZ-cd), BRb: p(W/2+cd, H-ch, clmZ-cd),
    FLb: p(W/2-cd, H-ch, clmZ+cd), FRb: p(W/2+cd, H-ch, clmZ+cd),
    FLt: p(W/2-cd, H,    clmZ+cd), FRt: p(W/2+cd, H,    clmZ+cd),
  }
  const q = (...qs: { x: number; y: number }[]) =>
    qs.map(v => `${v.x},${v.y}`).join(' ')

  // ── Helpers ────────────────────────────────────────────────────────────────
  const svgP   = ([x, y, z]: Pt) => p(x, y, z)
  const pBLF   = svgP(BLF), pBLC = svgP(BLC)
  const pFLF   = svgP(FLF), pFRF = svgP(FRF)

  function arrowHead(cx: number, cy: number, dx: number, dy: number, s = 5) {
    const len = Math.sqrt(dx*dx + dy*dy) || 1
    const ux = dx/len, uy = dy/len, nx = -uy, ny = ux
    return `M ${cx} ${cy} L ${cx-ux*s+nx*(s/2)} ${cy-uy*s+ny*(s/2)} L ${cx-ux*s-nx*(s/2)} ${cy-uy*s-ny*(s/2)} Z`
  }

  const statusTint =
    status === 'compatible'   ? 'rgba(34,197,94,0.07)'  :
    status === 'conditional'  ? 'rgba(245,158,11,0.07)' :
    status === 'incompatible' ? 'rgba(239,68,68,0.07)'  : 'none'

  // Min-height line on walls (only show if ceiling > min)
  const showMinH = H > MIN_H

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Live 3D Preview</span>
        {isComplete && status && (
          <span className={`ml-auto text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
            status === 'compatible'   ? 'text-green-700 bg-green-100'  :
            status === 'conditional'  ? 'text-amber-700 bg-amber-100'  :
                                        'text-red-700   bg-red-100'
          }`}>
            {status === 'compatible' ? '✓ Compatible' : status === 'conditional' ? '⚠ Check Issues' : '✗ Not Compatible'}
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full rounded-xl border border-gray-200 bg-white shadow-sm">
        <defs>
          <linearGradient id="screenSurf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a4a2a" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0d1f0d" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E6E6E6" /><stop offset="100%" stopColor="#DCDCDC" />
          </linearGradient>
          <linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CC1B32" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#CC1B32" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* 1. Ceiling */}
        <polygon points={pts(BLC,BRC,FRC,FLC)} fill={FACE.ceiling} stroke={FACE.edge} strokeWidth="1" />

        {/* 2. Back wall */}
        <polygon points={pts(BLF,BRF,BRC,BLC)} fill={FACE.back} stroke={FACE.edge} strokeWidth="1" />
        {statusTint !== 'none' && (
          <polygon points={pts(BLF,BRF,BRC,BLC)} fill={statusTint} />
        )}

        {/* Min-height lines */}
        {showMinH && (
          <>
            <line x1={p(0,MIN_H,0).x} y1={p(0,MIN_H,0).y} x2={p(W,MIN_H,0).x} y2={p(W,MIN_H,0).y}
              stroke="#EF4444" strokeWidth="1.25" strokeDasharray="5,4" opacity="0.65" />
            <text x={p(W,MIN_H,0).x+5} y={p(W,MIN_H,0).y+3} fill="#EF4444" fontSize="9" fontFamily="Inter,sans-serif" opacity="0.8">{fmtLen(MIN_H)} min</text>
          </>
        )}

        {/* 3. Left wall */}
        <polygon points={pts(BLF,BLC,FLC,FLF)} fill={FACE.left} stroke={FACE.edge} strokeWidth="1" />
        {showMinH && (
          <line x1={p(0,MIN_H,0).x} y1={p(0,MIN_H,0).y} x2={p(0,MIN_H,D).x} y2={p(0,MIN_H,D).y}
            stroke="#EF4444" strokeWidth="1" strokeDasharray="5,4" opacity="0.4" />
        )}

        {/* 4. Floor */}
        <polygon points={pts(BLF,BRF,FRF,FLF)} fill="url(#floorGrad)" stroke={FACE.edge} strokeWidth="1" />

        {/* Screen distance marker on floor (dashed line from back wall to hit position) */}
        <line
          x1={p(W/2, 0, 0).x}  y1={p(W/2, 0, 0).y}
          x2={p(W/2, 0, SD).x} y2={p(W/2, 0, SD).y}
          stroke="#CC1B32" strokeWidth="1" strokeDasharray="4,3" opacity="0.35"
        />

        {/* Detection zone */}
        <polygon points={pts(DZ.BL,DZ.BR,DZ.FR,DZ.FL)}
          fill="#CC1B32" opacity="0.07"
          stroke="#CC1B32" strokeWidth="0.75" strokeDasharray="3,3" strokeOpacity="0.28" />

        {/* Hitting position */}
        <ellipse cx={svgP(HIT).x} cy={svgP(HIT).y} rx={dz*scale*0.35} ry={dz*scale*0.14}
          fill="#CC1B32" opacity="0.2" />
        <circle  cx={svgP(HIT).x} cy={svgP(HIT).y} r={3.5} fill="#CC1B32" opacity="0.55" />

        {/* 5. Screen */}
        <polygon points={pts([scrX0,0,0],[scrX1,0,0],[scrX1,scrH,0],[scrX0,scrH,0])}
          fill="#222222" stroke="#CC1B32" strokeWidth="1.75" />
        <polygon points={pts([scrX0,0,0],[scrX1,0,0],[scrX1,scrH,0],[scrX0,scrH,0])}
          fill="url(#screenSurf)" />

        {/* 6. Detection cone */}
        {([DZ.BL, DZ.BR, DZ.FR, DZ.FL] as Pt[]).map((corner, i) => {
          const cl = svgP(CLM), co = svgP(corner)
          return <line key={i} x1={cl.x} y1={cl.y+8} x2={co.x} y2={co.y}
            stroke="#CC1B32" strokeWidth="0.75" strokeDasharray="4,4" opacity="0.25" />
        })}
        <polygon points={q(svgP(CLM), svgP(DZ.FR), svgP(DZ.FL))} fill="url(#coneGrad)" />

        {/* 7. CLM device */}
        <polygon points={q(clm.BLb,clm.BRb,clm.FRb,clm.FLb)} fill="#DDDDDD" stroke="#BBBBBB" strokeWidth="0.75" />
        <polygon points={q(clm.BLt,clm.BRt,clm.BRb,clm.BLb)} fill="#E8E8E8" stroke="#BBBBBB" strokeWidth="0.75" />
        <polygon points={q(clm.BRt,clm.FRt,clm.FRb,clm.BRb)} fill="#E0E0E0" stroke="#BBBBBB" strokeWidth="0.75" />
        <polygon points={q(clm.FLt,clm.FRt,clm.FRb,clm.FLb)} fill="#EFEFEF" stroke="#BBBBBB" strokeWidth="0.75" />
        {/* LED */}
        {(() => {
          const lx1 = clm.FLb.x + (clm.FRb.x - clm.FLb.x) * 0.18
          const ly1 = clm.FLb.y + (clm.FRb.y - clm.FLb.y) * 0.18 - 3
          const lx2 = clm.FRb.x - (clm.FRb.x - clm.FLb.x) * 0.18
          const ly2 = clm.FRb.y - (clm.FRb.y - clm.FLb.y) * 0.18 - 3
          return <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#CC1B32" strokeWidth="3" opacity="0.9" strokeLinecap="round" />
        })()}
        <circle cx={(clm.FLb.x+clm.FRb.x)/2} cy={(clm.FLb.y+clm.FRb.y)/2+1}
          r={2.5} fill="#555555" stroke="#888888" strokeWidth="0.5" />

        {/* 8. Ball flight arc */}
        <path d={`M ${arcS.x} ${arcS.y} C ${arcC1.x} ${arcC1.y} ${arcC2.x} ${arcC2.y} ${arcE.x} ${arcE.y}`}
          stroke="#22863a" strokeWidth="1.75" strokeDasharray="5,3" fill="none" opacity="0.65" />
        <circle cx={arcE.x} cy={arcE.y} r={4} fill="#22863a" opacity="0.75" />

        {/* 9. Screen distance label on floor */}
        {(() => {
          const mid = p(W/2, 0, SD/2)
          const off = 10
          return (
            <text x={mid.x + off} y={mid.y} fill="#CC1B32" fontSize="8.5" fontFamily="Inter,sans-serif"
              fontWeight="600" opacity="0.65" textAnchor="start">
              {fmtLen(values.screenDistance)}
            </text>
          )
        })()}

        {/* 10. Dimension annotations ─────────────────────────────────────── */}

        {/* WIDTH — below front edge FLF → FRF */}
        {(() => {
          const off = 16
          const ax = pFLF.x, ay = pFLF.y + off
          const bx = pFRF.x, by = pFRF.y + off
          const mx = (ax+bx)/2, my = (ay+by)/2
          const dx = bx-ax, dy = by-ay
          return (
            <g opacity="0.75">
              <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#999" strokeWidth="1" />
              <line x1={pFLF.x} y1={pFLF.y} x2={ax} y2={ay} stroke="#BBBBBB" strokeWidth="0.75" strokeDasharray="2,2" />
              <line x1={pFRF.x} y1={pFRF.y} x2={bx} y2={by} stroke="#BBBBBB" strokeWidth="0.75" strokeDasharray="2,2" />
              <path d={arrowHead(ax,ay,-dx,-dy)} fill="#999" />
              <path d={arrowHead(bx,by,dx,dy)}   fill="#999" />
              <text x={mx} y={my+12} fill="#777" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700" textAnchor="middle">
                {fmtLen(W)} wide
              </text>
            </g>
          )
        })()}

        {/* HEIGHT — left edge of back wall BLF → BLC */}
        {(() => {
          const off = 14
          const ax = pBLF.x - off, ay = pBLF.y
          const bx = pBLC.x - off, by = pBLC.y
          const mx = (ax+bx)/2,    my = (ay+by)/2
          const dx = bx-ax, dy = by-ay
          return (
            <g opacity="0.75">
              <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#999" strokeWidth="1" />
              <line x1={pBLF.x} y1={pBLF.y} x2={ax} y2={ay} stroke="#BBBBBB" strokeWidth="0.75" strokeDasharray="2,2" />
              <line x1={pBLC.x} y1={pBLC.y} x2={bx} y2={by} stroke="#BBBBBB" strokeWidth="0.75" strokeDasharray="2,2" />
              <path d={arrowHead(ax,ay,-dx,-dy)} fill="#999" />
              <path d={arrowHead(bx,by,dx,dy)}   fill="#999" />
              <text x={mx-8} y={my} fill="#777" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700"
                textAnchor="middle" transform={`rotate(-90,${mx-8},${my})`}>
                {fmtLen(H)} high
              </text>
            </g>
          )
        })()}

        {/* DEPTH — left wall bottom edge BLF → FLF */}
        {(() => {
          const pFLF2 = svgP(FLF)
          const off   = 14
          const dx    = pFLF2.x - pBLF.x, dy = pFLF2.y - pBLF.y
          const len   = Math.sqrt(dx*dx + dy*dy) || 1
          const nx    = -dy/len, ny = dx/len
          const ax    = pBLF.x  + nx*off, ay = pBLF.y  + ny*off
          const bx    = pFLF2.x + nx*off, by = pFLF2.y + ny*off
          const mx    = (ax+bx)/2, my = (ay+by)/2
          return (
            <g opacity="0.75">
              <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#999" strokeWidth="1" />
              <line x1={pBLF.x}  y1={pBLF.y}  x2={ax} y2={ay} stroke="#BBBBBB" strokeWidth="0.75" strokeDasharray="2,2" />
              <line x1={pFLF2.x} y1={pFLF2.y} x2={bx} y2={by} stroke="#BBBBBB" strokeWidth="0.75" strokeDasharray="2,2" />
              <path d={arrowHead(ax,ay,ax-bx,ay-by)} fill="#999" />
              <path d={arrowHead(bx,by,bx-ax,by-ay)} fill="#999" />
              <text x={mx} y={my-7} fill="#777" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700" textAnchor="middle">
                {fmtLen(D)} deep
              </text>
            </g>
          )
        })()}

        {/* Suggested screen area label — above the screen on the back wall */}
        {(() => {
          const mid = p(W / 2, scrH + 0.15, 0)
          return (
            <text x={mid.x} y={mid.y - 3} fill="#999999" fontSize="8" fontFamily="Inter,sans-serif" textAnchor="middle" fontStyle="italic">
              Suggested screen area
            </text>
          )
        })()}

        {/* CLM label */}
        {(() => {
          const lp = p(W/2 + cd + 0.35, H - ch/2, clmZ)
          return <text x={lp.x+2} y={lp.y+3} fill="#999999" fontSize="8" fontFamily="Inter,sans-serif" fontWeight="600">CLM PRO</text>
        })()}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0 border-t border-dashed border-red-400 opacity-70" />
          <span className="text-[10px] text-gray-400">{fmtLen(MIN_H)} min height</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0 border-t border-dashed border-brand opacity-40" />
          <span className="text-[10px] text-gray-400">Sensing zone / screen distance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-0 border-t border-dashed border-green-700 opacity-60" />
          <span className="text-[10px] text-gray-400">Ball flight</span>
        </div>
      </div>
    </div>
  )
}
