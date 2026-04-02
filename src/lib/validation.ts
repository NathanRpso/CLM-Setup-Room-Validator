import type { Measurements, ValidationResult, ValidationIssue, Component } from './types'

// All thresholds stored in feet. Metric equivalents noted for reference.
const T = {
  ceilingHeight:  { hardMin: 8.86, hardMax: 10.5 },  // 2.7m – 3.2m (range, not higher-is-better)
  roomDepth:      { hardMin: 13.78, recommended: 16.4 }, // 4.2m, 5.0m
  roomWidth:      { hardMin: 9.84,  recommended: 13.78 }, // 3.0m, 4.2m
  screenDistance: { hardMin: 6,     recommended: 8  },
}

export function validate(m: Measurements): ValidationResult {
  const issues: ValidationIssue[] = []

  // Ceiling height: supported range is 2.7m–3.2m (8.86ft–10.5ft)
  if (m.ceilingHeight < T.ceilingHeight.hardMin) {
    issues.push({
      field: 'ceilingHeight', severity: 'error',
      message: `Ceiling height of ${m.ceilingHeight.toFixed(1)}ft (${(m.ceilingHeight * 0.3048).toFixed(1)}m) is below the 2.7m minimum.`,
      recommendation: 'CLM PRO requires at least 2.7m (9ft) of ceiling clearance. Consider the MLM2PRO for lower ceiling spaces.',
    })
  } else if (m.ceilingHeight > T.ceilingHeight.hardMax) {
    issues.push({
      field: 'ceilingHeight', severity: 'warning',
      message: `Ceiling height of ${m.ceilingHeight.toFixed(1)}ft (${(m.ceilingHeight * 0.3048).toFixed(1)}m) exceeds the 3.2m optimal range.`,
      recommendation: 'A ceiling drop mount is required to lower the CLM PRO to its optimal 2.7–3.2m sensing height.',
    })
  }

  if (m.roomDepth < T.roomDepth.hardMin) {
    issues.push({
      field: 'roomDepth', severity: 'error',
      message: `Room depth of ${m.roomDepth.toFixed(1)}ft (${(m.roomDepth * 0.3048).toFixed(1)}m) is below the 4.2m minimum.`,
      recommendation: 'A minimum of 4.2m (14ft) is required from back wall to hitting position for safe ball flight.',
    })
  } else if (m.roomDepth < T.roomDepth.recommended) {
    issues.push({
      field: 'roomDepth', severity: 'warning',
      message: `Room depth of ${m.roomDepth.toFixed(1)}ft (${(m.roomDepth * 0.3048).toFixed(1)}m) is in the functional but tight range.`,
      recommendation: 'This depth is workable but may feel tight depending on golfer height and technique. Confirm the space feels comfortable before purchasing.',
    })
  }

  if (m.roomWidth < T.roomWidth.hardMin) {
    issues.push({
      field: 'roomWidth', severity: 'error',
      message: `Room width of ${m.roomWidth.toFixed(1)}ft (${(m.roomWidth * 0.3048).toFixed(1)}m) is below the 3.0m minimum.`,
      recommendation: '3.0m (10ft) of lateral clearance is the absolute minimum for a safe swing path.',
    })
  } else if (m.roomWidth < T.roomWidth.recommended) {
    issues.push({
      field: 'roomWidth', severity: 'warning',
      message: `Room width of ${m.roomWidth.toFixed(1)}ft (${(m.roomWidth * 0.3048).toFixed(1)}m) provides limited lateral swing clearance.`,
      recommendation: '4.2m (14ft)+ recommended for comfortable clearance on both sides during a full swing.',
    })
  }

  if (m.screenDistance < T.screenDistance.hardMin) {
    issues.push({
      field: 'screenDistance', severity: 'error',
      message: `${m.screenDistance}ft screen distance is below the 6ft minimum.`,
      recommendation: 'At least 6ft between hitting position and screen is required for safety.',
    })
  } else if (m.screenDistance < T.screenDistance.recommended) {
    issues.push({
      field: 'screenDistance', severity: 'warning',
      message: `${m.screenDistance}ft is tight between golfer and screen.`,
      recommendation: '8ft+ from hitting position to screen is recommended for a comfortable setup.',
    })
  }

  if (m.screenDistance >= m.roomDepth) {
    issues.push({
      field: 'screenDistance', severity: 'error',
      message: 'Screen distance is equal to or greater than your room depth.',
      recommendation: 'Reduce screen distance or increase room depth — your hitting position must be inside the room.',
    })
  }

  if (m.ceilingMaterial === 'drop') {
    issues.push({
      field: 'ceilingMaterial', severity: 'warning',
      message: 'Drop ceilings require a structural anchor kit.',
      recommendation: 'You\'ll need to anchor through the drop tiles into the structural ceiling above. Kit sold separately.',
    })
  } else if (m.ceilingMaterial === 'concrete') {
    issues.push({
      field: 'ceilingMaterial', severity: 'warning',
      message: 'Concrete/masonry ceilings require a masonry anchor kit.',
      recommendation: 'A masonry anchor kit and masonry drill bits are required. Kit sold separately.',
    })
  } else if (m.ceilingMaterial === 'other') {
    issues.push({
      field: 'ceilingMaterial', severity: 'error',
      message: 'Non-standard ceiling material.',
      recommendation: 'Contact Rapsodo support before purchasing to confirm your ceiling type is compatible.',
    })
  }

  const errors = issues.filter(i => i.severity === 'error').length
  const status = errors > 0 ? 'incompatible' : issues.length > 0 ? 'conditional' : 'compatible'
  return { status, issues }
}

export function getComponents(m: Measurements): Component[] {
  const list: Component[] = [
    // ── Essential ──────────────────────────────────────────────────────
    {
      name: 'Impact Screen or Net',
      category: 'Essential',
      included: false,
      required: true,
      reason: 'Required surface to safely catch ball impact.',
    },
    {
      name: 'Screen Frame / Enclosure',
      category: 'Essential',
      included: false,
      required: true,
      reason: 'Structural surround and support for the impact screen or net.',
    },
    {
      name: 'Ceiling Mounting Bracket',
      category: 'Essential',
      included: true,
      required: true,
      reason: 'Standard ceiling mount included with your CLM PRO.',
    },
  ]

  // Anchor kits — Essential when required by ceiling type
  if (m.ceilingMaterial === 'drop') {
    list.push({
      name: 'Structural Anchor Kit',
      category: 'Essential',
      included: false,
      required: true,
      reason: 'Required for mounting through drop ceiling tiles into the structural ceiling above.',
    })
  }
  if (m.ceilingMaterial === 'concrete') {
    list.push({
      name: 'Masonry Anchor Kit',
      category: 'Essential',
      included: false,
      required: true,
      reason: 'Required for mounting into concrete or masonry ceilings.',
    })
  }

  // ── Recommended ────────────────────────────────────────────────────
  list.push(
    {
      name: 'Ethernet Cable',
      category: 'Recommended',
      included: false,
      required: false,
      reason: 'More stable than Wi-Fi for real-time shot data. Highly recommended.',
    },
    {
      name: 'Projector',
      category: 'Recommended',
      included: false,
      required: false,
      reason: 'Projects simulator visuals onto your screen for the full simulator experience.',
      note: 'Not required — a second monitor or TV works fine. A projector gives the most immersive setup.',
    },
    {
      name: 'HDMI Cable',
      category: 'Recommended',
      included: false,
      required: false,
      reason: 'Connects your PC to a projector or secondary display for simulator visuals.',
    },
  )

  // Ceiling drop mount — required when ceiling > 3.2m (10.5ft), which puts CLM above its sensing range
  if (m.ceilingHeight > 10.5) {
    list.push({
      name: 'Ceiling Drop Mount',
      category: 'Essential',
      included: false,
      required: true,
      reason: `Your ceiling of ${m.ceilingHeight.toFixed(1)}ft (${(m.ceilingHeight * 0.3048).toFixed(1)}m) exceeds the 3.2m optimal sensing height. A drop mount is required to position the CLM PRO correctly.`,
      note: 'Look for a VESA-compatible ceiling drop mount with adjustable pole length.',
    })
  }

  return list
}

export function isComplete(m: Partial<Measurements>): m is Measurements {
  return (
    m.ceilingHeight  != null && m.ceilingHeight  > 0 &&
    m.roomDepth      != null && m.roomDepth      > 0 &&
    m.roomWidth      != null && m.roomWidth      > 0 &&
    m.screenDistance != null && m.screenDistance > 0 &&
    m.ceilingMaterial != null && m.ceilingMaterial !== ''
  )
}
