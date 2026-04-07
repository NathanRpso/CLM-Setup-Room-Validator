import { useState } from 'react'
import type { Measurements } from '../lib/types'
import type { UnitSystem } from './MeasurementForm'

interface Props {
  values: Measurements
  isComplete: boolean
  status?: 'compatible' | 'conditional' | 'incompatible'
  unit?: UnitSystem
  simplified?: boolean
  flipped?: boolean
  onFlip?: () => void
}

const SVG_W = 600
const SVG_H = 420
const PL = 52, PR = 52, PT = 44, PB = 48
const DW = SVG_W - PL - PR
const DH = SVG_H - PT - PB

// True isometric: X-axis goes down-right at 30°, Z-axis goes down-left at 30°.
// Both axes have equal foreshortening so W=D produces a perfect rhombus floor.
const ISO = Math.PI / 6  // 30°
const COS = Math.cos(ISO)
const SIN = Math.sin(ISO)

const FACE = {
  back:    '#F5F5F5',
  left:    '#EEEEEE',
  floor:   '#E6E6E6',
  ceiling: '#F9F9F9',
  edge:    '#CCCCCC',
}

export default function RoomDiagram({ values, isComplete: _isComplete, status, unit = 'imperial', simplified = false, flipped = false, onFlip }: Props) {
  const [localFlipped, setLocalFlipped] = useState(false)
  const isFlipped = onFlip !== undefined ? flipped : localFlipped
  const handleFlip = onFlip ?? (() => setLocalFlipped(f => !f))

  const fmtLen = (ft: number) =>
    unit === 'metric' ? `${(ft * 0.3048).toFixed(1)} m` : `${ft.toFixed(1)} ft`

  const W  = values.roomWidth
  const H  = values.ceilingHeight
  const D  = values.roomDepth
  const SD = simplified ? 0 : D * 0.55

  // ── Scale ──────────────────────────────────────────────────────────────────
  const refWD = Math.max(W, 10) + Math.max(D, 10)
  const scale = Math.min(
    DW / (refWD * COS),
    DH / (Math.max(H, 8) + refWD * SIN),
  ) * 0.88

  // ── Origin ────────────────────────────────────────────────────────────────
  const totalW = (W + D) * COS * scale
  const totalH = H * scale + (W + D) * SIN * scale
  // Normal:  leftmost point is FLF (x=0,z=D) → needs +D*COS offset from left edge
  // Flipped: leftmost point is BRF (x=W,z=0) → needs +W*COS offset from left edge
  const oxNormal  = PL + (DW - totalW) / 2 + D * COS * scale
  const oxFlipped = PL + (DW - totalW) / 2 + W * COS * scale
  const oy = PT + (DH - totalH) / 2 + H * scale

  // Isometric 3-D → 2-D.
  // Normal:  X (width) → down-right (+COS), Z (depth) → down-left  (-COS)
  // Flipped: Z (depth) → down-right (+COS), X (width) → down-left  (-COS)
  // Vertical (x+z)*SIN is symmetric in both cases — BLF stays top, FRF bottom.
  const p = (x: number, y: number, z: number) => {
    const ox = isFlipped ? oxFlipped : oxNormal
    const h  = isFlipped ? (z - x) : (x - z)
    return {
      x: ox + h * COS * scale,
      y: oy - y * scale + (x + z) * SIN * scale,
    }
  }
  const pts = (...cs: [number, number, number][]) =>
    cs.map(([x, y, z]) => { const q = p(x, y, z); return `${q.x},${q.y}` }).join(' ')

  type Pt = [number, number, number]

  // ── Room corners ───────────────────────────────────────────────────────────
  const BLF: Pt = [0, 0, 0],  BRF: Pt = [W, 0, 0]
  const BLC: Pt = [0, H, 0],  BRC: Pt = [W, H, 0]
  const FLF: Pt = [0, 0, D],  FRF: Pt = [W, 0, D]
  const FLC: Pt = [0, H, D],  FRC: Pt = [W, H, D]

  // ── Projector screen (16:9, fits within back wall) ────────────────────────
  const ASPECT  = 16 / 9
  const maxScrW = Math.min(W * 0.82, W - 0.35)
  const maxScrH = Math.min(H * 0.82, H - 0.25)
  let scrW = maxScrW
  let scrH = scrW / ASPECT
  if (scrH > maxScrH) { scrH = maxScrH; scrW = Math.min(scrH * ASPECT, maxScrW) }
  const scrX0 = (W - scrW) / 2
  const scrX1 = scrX0 + scrW

  // ── CLM: mounted at ceiling (or via drop mount if ceiling > 3.2m / 10.5ft) ─
  const needsDropMount = H > 10.5
  // Ideal sensing height is 3.0m = 9.84ft; drop mount lowers CLM to that height
  const clmMountH = needsDropMount ? 9.84 : H
  const hitZ = SD                              // hitting area z-position (55% of room depth)
  const clmZ = Math.max(0, SD - 1 / 0.3048)   // CLM is 1m closer to screen than hitting area
  const CLM: Pt = [W / 2, clmMountH, clmZ]
  const HIT: Pt = [W / 2, 0, hitZ]

  // Detection zone — centred around hitting position, not CLM mount point
  const dz = 1.8
  const DZ = {
    BL: [W/2-dz, 0, hitZ-dz] as Pt,
    BR: [W/2+dz, 0, hitZ-dz] as Pt,
    FR: [W/2+dz, 0, hitZ+dz] as Pt,
    FL: [W/2-dz, 0, hitZ+dz] as Pt,
  }

  // ── Ball flight arc ────────────────────────────────────────────────────────
  const arcS  = p(W/2, 0.3,         hitZ)
  const arcC1 = p(W/2, clmMountH * 0.38, SD * 0.5)
  const arcC2 = p(W/2, scrH * 0.75, SD * 0.08)
  const arcE  = p(W/2, scrH * 0.42, 0.06)

  // ── CLM device geometry — slim wide bar (matches physical device proportions) ─
  const cw = 1.1 / 0.3048 / 2, cd = 0.15 / 0.3048 / 2, ch = 0.10 / 0.3048  // half-width, half-depth, height (ft)
  const clm = {
    BLt: p(W/2-cw, clmMountH,    clmZ-cd), BRt: p(W/2+cw, clmMountH,    clmZ-cd),
    BLb: p(W/2-cw, clmMountH-ch, clmZ-cd), BRb: p(W/2+cw, clmMountH-ch, clmZ-cd),
    FLb: p(W/2-cw, clmMountH-ch, clmZ+cd), FRb: p(W/2+cw, clmMountH-ch, clmZ+cd),
    FLt: p(W/2-cw, clmMountH,    clmZ+cd), FRt: p(W/2+cw, clmMountH,    clmZ+cd),
  }
  const q = (...qs: { x: number; y: number }[]) =>
    qs.map(v => `${v.x},${v.y}`).join(' ')

  const svgP  = ([x, y, z]: Pt) => p(x, y, z)
  const pBRF  = svgP(BRF), pBRC = svgP(BRC)
  const pFLF  = svgP(FLF), pFRF = svgP(FRF)

  function arrowHead(cx: number, cy: number, dx: number, dy: number, s = 5) {
    const len = Math.sqrt(dx*dx + dy*dy) || 1
    const ux = dx/len, uy = dy/len, nx = -uy, ny = ux
    return `M ${cx} ${cy} L ${cx-ux*s+nx*(s/2)} ${cy-uy*s+ny*(s/2)} L ${cx-ux*s-nx*(s/2)} ${cy-uy*s-ny*(s/2)} Z`
  }

  const statusTint =
    status === 'compatible'   ? 'rgba(34,197,94,0.07)'  :
    status === 'conditional'  ? 'rgba(245,158,11,0.07)' :
    status === 'incompatible' ? 'rgba(239,68,68,0.07)'  : 'none'

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Room Visualiser</span>
      </div>

      <div className="relative">
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

        {/* 1. Back wall */}
        <polygon points={pts(BLF,BRF,BRC,BLC)} fill={FACE.back} stroke={FACE.edge} strokeWidth="1" />
        {statusTint !== 'none' && (
          <polygon points={pts(BLF,BRF,BRC,BLC)} fill={statusTint} />
        )}

        {/* 3. Left wall */}
        <polygon points={pts(BLF,BLC,FLC,FLF)} fill={FACE.left} stroke={FACE.edge} strokeWidth="1" />

        {/* 4. Floor */}
        <polygon points={pts(BLF,BRF,FRF,FLF)} fill="url(#floorGrad)" stroke={FACE.edge} strokeWidth="1" />

        {/* Green hitting mat */}
        {!simplified && (() => {
          const mw = 2.5, md = 2.0
          const ML: [number,number,number][] = [
            [W/2-mw, 0, hitZ-md], [W/2+mw, 0, hitZ-md],
            [W/2+mw, 0, hitZ+md], [W/2-mw, 0, hitZ+md],
          ]
          return (
            <polygon
              points={ML.map(([x,y,z]) => { const q = p(x,y,z); return `${q.x},${q.y}` }).join(' ')}
              fill="#2d6a2d" opacity="0.35" stroke="#22863a" strokeWidth="0.75" strokeOpacity="0.5"
            />
          )
        })()}

        {/* Detection zone */}
        {!simplified && <polygon points={pts(DZ.BL,DZ.BR,DZ.FR,DZ.FL)}
          fill="#CC1B32" opacity="0.07"
          stroke="#CC1B32" strokeWidth="0.75" strokeDasharray="3,3" strokeOpacity="0.28" />}

        {/* Hitting position */}
        {!simplified && <>
          <ellipse cx={svgP(HIT).x} cy={svgP(HIT).y} rx={dz*scale*0.35} ry={dz*scale*0.14}
            fill="#CC1B32" opacity="0.2" />
          <circle cx={svgP(HIT).x} cy={svgP(HIT).y} r={3.5} fill="#CC1B32" opacity="0.55" />
        </>}

        {/* 5. Projector screen — translucent fill, dotted outline */}
        <polygon points={pts([scrX0,0,0],[scrX1,0,0],[scrX1,scrH,0],[scrX0,scrH,0])}
          fill="#111111" fillOpacity="0.5"
          stroke="#CC1B32" strokeWidth="1.5" strokeDasharray="5,3" />

        {/* 6. Detection cone */}
        {!simplified && ([DZ.BL, DZ.BR, DZ.FR, DZ.FL] as Pt[]).map((corner, i) => {
          const cl = svgP(CLM), co = svgP(corner)
          return <line key={i} x1={cl.x} y1={cl.y+8} x2={co.x} y2={co.y}
            stroke="#CC1B32" strokeWidth="0.75" strokeDasharray="4,4" opacity="0.25" />
        })}
        {!simplified && <polygon points={q(svgP(CLM), svgP(DZ.FR), svgP(DZ.FL))} fill="url(#coneGrad)" />}

        {/* 7. CLM device — slim dark bar with red LED strips on bottom face */}
        {!simplified && <>
          {/* Bottom face */}
          <polygon points={q(clm.BLb,clm.BRb,clm.FRb,clm.FLb)} fill="#1a1a1a" stroke="#333" strokeWidth="0.75" />
          {/* Back face */}
          <polygon points={q(clm.BLt,clm.BRt,clm.BRb,clm.BLb)} fill="#222222" stroke="#333" strokeWidth="0.75" />
          {/* Right face */}
          <polygon points={q(clm.BRt,clm.FRt,clm.FRb,clm.BRb)} fill="#2a2a2a" stroke="#333" strokeWidth="0.75" />
          {/* Front face */}
          <polygon points={q(clm.FLt,clm.FRt,clm.FRb,clm.FLb)} fill="#252525" stroke="#333" strokeWidth="0.75" />
          {/* Top face */}
          <polygon points={q(clm.BLt,clm.BRt,clm.FRt,clm.FLt)} fill="#2e2e2e" stroke="#333" strokeWidth="0.75" />
          {/* Two red LED strips on bottom face */}
          {(() => {
            const lerp = (a: {x:number,y:number}, b: {x:number,y:number}, t: number) =>
              ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
            const BL = clm.BLb, BR = clm.BRb, FL = clm.FLb, FR = clm.FRb
            // Single red LED pill centred on the bottom face
            const s1a = lerp(lerp(BL,BR,0.455), lerp(FL,FR,0.455), 0.5)
            const s1b = lerp(lerp(BL,BR,0.545), lerp(FL,FR,0.545), 0.5)
            return <line x1={s1a.x} y1={s1a.y} x2={s1b.x} y2={s1b.y} stroke="#CC1B32" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
          })()}
        </>}

        {/* 8. Ball flight arc */}
        {!simplified && <>
          <path d={`M ${arcS.x} ${arcS.y} C ${arcC1.x} ${arcC1.y} ${arcC2.x} ${arcC2.y} ${arcE.x} ${arcE.y}`}
            stroke="#22863a" strokeWidth="1.75" strokeDasharray="5,3" fill="none" opacity="0.65" />
          <circle cx={arcE.x} cy={arcE.y} r={5} fill="white" stroke="#CCCCCC" strokeWidth="0.75" />
          <circle cx={arcE.x - 1.5} cy={arcE.y - 1.5} r={0.9} fill="#DDDDDD" opacity="0.8" />
          <circle cx={arcE.x + 1.8} cy={arcE.y - 1.2} r={0.9} fill="#DDDDDD" opacity="0.8" />
          <circle cx={arcE.x + 0.3} cy={arcE.y + 1.8} r={0.9} fill="#DDDDDD" opacity="0.8" />
          <circle cx={arcE.x - 2.0} cy={arcE.y + 1.0} r={0.9} fill="#DDDDDD" opacity="0.8" />
        </>}

        {/* 9. Dimension annotations ─────────────────────────────────────────── */}

        {/* WIDTH — below front edge FLF→FRF */}
        {(() => {
          const off = 22
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
              {/* Label below the line, offset away from room */}
              <text x={mx + (isFlipped ? 18 : -18)} y={my+18} fill="#777" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700" textAnchor="middle">
                {simplified ? `W  ${fmtLen(W)}` : `${fmtLen(W)} wide`}
              </text>
            </g>
          )
        })()}

        {/* HEIGHT — right edge of back wall BRF→BRC */}
        {(() => {
          const side = isFlipped ? -1 : 1
          const off = 14
          const ax = pBRF.x + side*off, ay = pBRF.y
          const bx = pBRC.x + side*off, by = pBRC.y
          const mx = (ax+bx)/2,    my = (ay+by)/2
          const dx = bx-ax, dy = by-ay
          const tx = mx + side*12
          return (
            <g opacity="0.75">
              <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#999" strokeWidth="1" />
              <line x1={pBRF.x} y1={pBRF.y} x2={ax} y2={ay} stroke="#BBBBBB" strokeWidth="0.75" strokeDasharray="2,2" />
              <line x1={pBRC.x} y1={pBRC.y} x2={bx} y2={by} stroke="#BBBBBB" strokeWidth="0.75" strokeDasharray="2,2" />
              <path d={arrowHead(ax,ay,-dx,-dy)} fill="#999" />
              <path d={arrowHead(bx,by,dx,dy)}   fill="#999" />
              <text x={tx} y={my} fill="#777" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700"
                textAnchor="middle" transform={`rotate(${-90*side},${tx},${my})`}>
                {simplified ? `H  ${fmtLen(H)}` : `${fmtLen(H)} high`}
              </text>
            </g>
          )
        })()}

        {/* DEPTH — along BRF→FRF edge; normal flips outward when perspective flips */}
        {(() => {
          const dx  = pFRF.x - pBRF.x, dy = pFRF.y - pBRF.y
          const len = Math.sqrt(dx*dx + dy*dy) || 1
          // Base outward normal (right side in normal view); negate when flipped
          const side = isFlipped ? -1 : 1
          const nx = side * dy/len, ny = side * (-dx/len)
          const off = 18
          const ax  = pBRF.x + nx*off, ay = pBRF.y + ny*off
          const bx  = pFRF.x + nx*off, by = pFRF.y + ny*off
          const mx  = (ax+bx)/2, my = (ay+by)/2
          const lx  = mx + nx*32, ly = my + ny*32
          return (
            <g opacity="0.75">
              <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#999" strokeWidth="1" />
              <line x1={pBRF.x} y1={pBRF.y} x2={ax} y2={ay} stroke="#BBBBBB" strokeWidth="0.75" strokeDasharray="2,2" />
              <line x1={pFRF.x} y1={pFRF.y} x2={bx} y2={by} stroke="#BBBBBB" strokeWidth="0.75" strokeDasharray="2,2" />
              <path d={arrowHead(ax,ay,ax-bx,ay-by)} fill="#999" />
              <path d={arrowHead(bx,by,bx-ax,by-ay)} fill="#999" />
              <text x={lx} y={ly} fill="#777" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700" textAnchor="middle">
                {simplified ? `D  ${fmtLen(D)}` : `${fmtLen(D)} deep`}
              </text>
            </g>
          )
        })()}

        {/* Screen wall label — centred in screen face, parallel to screen edge */}
        {(() => {
          const midL  = p(scrX0, 0.5, 0)
          const midR  = p(scrX1, 0.5, 0)
          // Always orient text left-to-right
          const [tL, tR] = midL.x < midR.x ? [midL, midR] : [midR, midL]
          const mx    = (tL.x + tR.x) / 2
          const my    = (tL.y + tR.y) / 2
          const angle = Math.atan2(tR.y - tL.y, tR.x - tL.x) * 180 / Math.PI
          return (
            <text x={mx} y={my} fill="rgba(255,255,255,0.55)" fontSize="8"
              fontFamily="Inter,sans-serif" textAnchor="middle" fontStyle="italic"
              transform={`rotate(${angle},${mx},${my})`}>
              Screen wall
            </text>
          )
        })()}

        {/* Drop mount pole — ceiling to CLM top, only when needsDropMount */}
        {!simplified && needsDropMount && (() => {
          const ceilPt = p(W/2, H,          clmZ)
          const clmTop = p(W/2, clmMountH,  clmZ)
          return (
            <g>
              {/* Pole */}
              <line x1={ceilPt.x} y1={ceilPt.y} x2={clmTop.x} y2={clmTop.y}
                stroke="#888888" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              {/* Bracket collar at ceiling */}
              <circle cx={ceilPt.x} cy={ceilPt.y} r={3.5} fill="#AAAAAA" opacity="0.85" />
            </g>
          )
        })()}

        {/* CLM PRO label — leader into open space; direction flips with view */}
        {!simplified && (() => {
          const dev = p(W/2, clmMountH, clmZ)
          const xOff = isFlipped ? 60 : -60
          const lx1 = dev.x + (isFlipped ? 4 : -4), ly1 = dev.y - 8
          const lx2 = dev.x + xOff, ly2 = dev.y - 60
          return (
            <g opacity="0.85">
              <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#AAAAAA" strokeWidth="0.75" />
              <text x={isFlipped ? lx2 + 3 : lx2 - 3} y={ly2 + 3} fill="#888" fontSize="8.5"
                fontFamily="Inter,sans-serif" fontWeight="700" textAnchor={isFlipped ? 'start' : 'end'}>
                CLM PRO
              </text>
            </g>
          )
        })()}

        {/* Ceiling — drawn last so it sits translucently over all room contents */}
        <polygon points={pts(BLC,BRC,FRC,FLC)}
          fill={FACE.ceiling} fillOpacity="0.35"
          stroke={FACE.edge} strokeWidth="1" />
      </svg>

        {/* Flip button — bottom-right corner of the visualiser */}
        <button
          onClick={handleFlip}
          title="Flip perspective"
          className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 shadow-sm transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4.5h9M7 2l3 2.5L7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 9.5H4M7 12L4 9.5 7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
