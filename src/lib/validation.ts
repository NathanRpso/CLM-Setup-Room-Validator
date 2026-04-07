import type { Measurements, ValidationResult, ValidationIssue, Component } from './types'

// All thresholds stored in feet. Metric equivalents noted for reference.
const T = {
  ceilingHeight: { hardMin: 8.86, hardMax: 10.5 },     // 2.7m – 3.2m (range, not higher-is-better)
  roomDepth:     { hardMin: 13.78, recommended: 16.4 }, // 4.2m, 5.0m
  roomWidth:     { hardMin: 9.84,  recommended: 13.78 }, // 3.0m, 4.2m
}

function fmt(ft: number, unit: 'imperial' | 'metric') {
  return unit === 'metric'
    ? `${(ft * 0.3048).toFixed(1)} m`
    : `${ft.toFixed(1)} ft`
}

export function validate(m: Measurements, unit: 'imperial' | 'metric' = 'imperial'): ValidationResult {
  const issues: ValidationIssue[] = []

  // Ceiling height: supported range is 2.7m–3.2m (8.86ft–10.5ft)
  if (m.ceilingHeight < T.ceilingHeight.hardMin) {
    issues.push({
      field: 'ceilingHeight', severity: 'error',
      message: `Your ceiling is too low.`,
      recommendation: `CLM PRO needs at least ${fmt(T.ceilingHeight.hardMin, unit)} of clearance. An MLM2PRO may be better suited for your room.`,
    })
  } else if (m.ceilingHeight > T.ceilingHeight.hardMax) {
    issues.push({
      field: 'ceilingHeight', severity: 'warning',
      message: `Your ceiling is high - you'll also need a drop mount.`,
      recommendation: `At ${fmt(m.ceilingHeight, unit)}, a VESA drop mount is required to lower the CLM PRO into its optimal sensing range of ${fmt(T.ceilingHeight.hardMin, unit)}–${fmt(T.ceilingHeight.hardMax, unit)}.`,
    })
  }

  if (m.roomDepth < T.roomDepth.hardMin) {
    issues.push({
      field: 'roomDepth', severity: 'error',
      message: `Your room isn't deep enough - ${fmt(m.roomDepth, unit)} is too short.`,
      recommendation: `A minimum of ${fmt(T.roomDepth.hardMin, unit)} is recommended for a safe swing and ball flight.`,
    })
  } else if (m.roomDepth < T.roomDepth.recommended) {
    issues.push({
      field: 'roomDepth', severity: 'warning',
      message: `Room depth is tight at ${fmt(m.roomDepth, unit)}.`,
      recommendation: `This can work but may feel cramped depending on your height and swing. Test the space before purchasing - ${fmt(T.roomDepth.recommended, unit)} is recommended.`,
    })
  }

  if (m.roomWidth < T.roomWidth.hardMin) {
    issues.push({
      field: 'roomWidth', severity: 'error',
      message: `Your room is too narrow.`,
      recommendation: `We recommend at least ${fmt(T.roomWidth.hardMin, unit)} of side-to-side clearance for a full swing without hitting the walls.`,
    })
  } else if (m.roomWidth < T.roomWidth.recommended) {
    issues.push({
      field: 'roomWidth', severity: 'warning',
      message: `Room width is tight at ${fmt(m.roomWidth, unit)}.`,
      recommendation: `${fmt(T.roomWidth.recommended, unit)}+ is recommended for a comfortable clearance on both sides.`,
    })
  }

  if (m.ceilingMaterial === 'drop') {
    issues.push({
      field: 'ceilingMaterial', severity: 'warning',
      message: 'Drop ceiling - you\'ll need a structural anchor kit.',
      recommendation: 'You\'ll need to anchor through the drop tiles into the structural ceiling above. Please ensure you purchase this separately.',
    })
  } else if (m.ceilingMaterial === 'concrete') {
    issues.push({
      field: 'ceilingMaterial', severity: 'warning',
      message: 'Concrete ceiling - you\'ll need a masonry anchor kit.',
      recommendation: 'A masonry drill and anchor kit are required for mounting into concrete. Please ensure you purchase these separately.',
    })
  } else if (m.ceilingMaterial === 'other') {
    issues.push({
      field: 'ceilingMaterial', severity: 'warning',
      message: 'Ceiling type unverified - contact us before purchasing.',
      recommendation: 'We can\'t confirm compatibility without knowing your ceiling type. Our team can help you figure out the right fix.',
    })
  }

  const errors = issues.filter(i => i.severity === 'error').length
  const status = errors > 0 ? 'incompatible' : issues.length > 0 ? 'conditional' : 'compatible'
  return { status, issues }
}

export function getComponents(m: Measurements, unit: 'imperial' | 'metric' = 'imperial'): Component[] {
  const needsDropMount = m.ceilingHeight > 10.5

  // ── Screen frame max depth ────────────────────────────────────────────────
  // CLM is mounted 1m closer to the screen than the hitting position (hitDepth = D × 0.55).
  // The symmetric forward FOV angle (toward screen) limits how far the frame can protrude:
  //   maxScrD = hitDepth − 2 × 1m  (clmZ − 1m, i.e. 1m in front of the CLM toward screen)
  const M_TO_FT  = 1 / 0.3048
  const hitDepth = m.roomDepth * 0.55
  const maxScrD  = Math.max(0.5, hitDepth - 2 * M_TO_FT)
  const list: Component[] = [
    // ── Essential ──────────────────────────────────────────────────────
    {
      name: 'Impact Screen',
      category: 'Essential',
      included: false,
      required: true,
      reason: 'Multi-layer screen rated for driver speeds. Safely stops the ball.',
      image: '/icons/impact-screen.webp',
    },
    {
      name: 'Screen Frame',
      category: 'Essential',
      included: false,
      required: true,
      reason: `Keep the frame depth under ${fmt(maxScrD, unit)} from the wall — any deeper and it enters the CLM PRO's field of view.`,
      image: '/icons/screen-frame.png',
    },
  ]

  // ── Fixings based on ceiling material ────────────────────────────────────
  if (m.ceilingMaterial === 'drywall') {
    list.push({
      name: 'Ceiling Screws & Plugs',
      category: 'Essential',
      included: false,
      required: true,
      reason: 'M6 × 50mm timber screws into joists. Nylon plugs where joists aren\'t accessible.',
      image: '/icons/screw.png',
    })
  } else if (m.ceilingMaterial === 'drop') {
    list.push({
      name: 'Toggle Bolt Kit',
      category: 'Essential',
      included: false,
      required: true,
      reason: 'M8 toggle bolts that anchor into the structural ceiling above the drop tiles.',
      image: '/icons/toggle-bolt.png',
    })
  } else if (m.ceilingMaterial === 'concrete') {
    list.push({
      name: 'Masonry Anchor Kit',
      category: 'Essential',
      included: false,
      required: true,
      reason: 'M8 sleeve anchors with a masonry bit. Standard screws won\'t hold in concrete.',
      image: '/icons/masonry-anchor.png',
    })
  } else if (m.ceilingMaterial === 'wood') {
    list.push({
      name: 'Structural Lag Screws',
      category: 'Essential',
      included: false,
      required: true,
      reason: 'M8 × 80mm lag screws direct into the beam. No anchors needed.',
      image: '/icons/lag-screw.png',
    })
  }

  // Drop mount — required when ceiling > 3.2m (10.5ft)
  if (needsDropMount) {
    list.push({
      name: 'Ceiling Drop Mount',
      category: 'Essential',
      included: false,
      required: true,
      reason: `Lowers the CLM PRO to its ideal ${fmt(9.84, unit)} sensing height from your ${fmt(m.ceilingHeight, unit)} ceiling.`,
      image: '/icons/drop-mount.png',
    })
  }

  // ── Recommended ──────────────────────────────────────────────────────────
  list.push(
    {
      name: 'Projector',
      category: 'Recommended',
      included: false,
      required: false,
      reason: 'Short-throw projector for the full simulator experience. ≥3000 lumens recommended.',
      image: '/icons/projector.png',
    },
    {
      name: 'Ethernet Cable',
      category: 'Recommended',
      included: false,
      required: false,
      reason: 'More reliable than Wi-Fi. Run a Cat6 cable to the hitting position.',
      image: '/icons/ethernet-cable.png',
    },
    {
      name: 'HDMI Cable',
      category: 'Recommended',
      included: false,
      required: false,
      reason: 'Connects your PC to the projector or display. Go 4K-rated if supported.',
      image: '/icons/hdmi-cable.png',
    },
  )

  // ── What's in the box ─────────────────────────────────────────────────────
  list.push(
    {
      name: 'CLM PRO Device',
      category: 'InBox',
      included: true,
      required: true,
      reason: 'Your launch monitor, ready to ceiling-mount above the hitting position.',
      image: '/icons/clm-device.jpg',
    },
    {
      name: 'Power Cable',
      category: 'InBox',
      included: true,
      required: true,
      reason: 'Mains power cable. Ensure an outlet is within reach of the mount point.',
      image: '/icons/power-cable.png',
    },
    {
      name: 'Ceiling Mounting Bracket',
      category: 'InBox',
      included: true,
      required: true,
      reason: 'Standard bracket for drywall and timber. Other ceiling types need an anchor kit.',
      image: '/icons/ceiling-mount.png',
    },
  )

  return list
}

export function isComplete(m: Partial<Measurements>): m is Measurements {
  return (
    m.ceilingHeight  != null && m.ceilingHeight  > 0 &&
    m.roomDepth      != null && m.roomDepth      > 0 &&
    m.roomWidth      != null && m.roomWidth      > 0 &&
    m.ceilingMaterial != null && m.ceilingMaterial !== ''
  )
}
