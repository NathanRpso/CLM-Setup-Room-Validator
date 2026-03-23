import type { Measurements, ValidationResult, ValidationIssue, Component } from './types'

const T = {
  ceilingHeight:  { hardMin: 9,  recommended: 10 },
  roomDepth:      { hardMin: 15, recommended: 18 },
  roomWidth:      { hardMin: 12, recommended: 14 },
  screenDistance: { hardMin: 6,  recommended: 8  },
}

export function validate(m: Measurements): ValidationResult {
  const issues: ValidationIssue[] = []

  if (m.ceilingHeight < T.ceilingHeight.hardMin) {
    issues.push({
      field: 'ceilingHeight', severity: 'error',
      message: `${m.ceilingHeight}ft ceiling is below the 9ft minimum.`,
      recommendation: 'CLM PRO requires at least 9ft of ceiling clearance. Consider the MLM2PRO for lower ceiling spaces.',
    })
  } else if (m.ceilingHeight < T.ceilingHeight.recommended) {
    issues.push({
      field: 'ceilingHeight', severity: 'warning',
      message: `${m.ceilingHeight}ft ceiling is workable but tight.`,
      recommendation: 'A ceiling drop mount is recommended to bring the CLM to its optimal 9–10ft sensing height.',
    })
  }

  if (m.roomDepth < T.roomDepth.hardMin) {
    issues.push({
      field: 'roomDepth', severity: 'error',
      message: `${m.roomDepth}ft room depth is below the 15ft minimum.`,
      recommendation: 'A minimum of 15ft is required from back wall to screen for safe ball flight.',
    })
  } else if (m.roomDepth < T.roomDepth.recommended) {
    issues.push({
      field: 'roomDepth', severity: 'warning',
      message: `${m.roomDepth}ft is functional but 18ft+ improves data accuracy.`,
      recommendation: 'At this depth, trajectory data for driver may have reduced accuracy.',
    })
  }

  if (m.roomWidth < T.roomWidth.hardMin) {
    issues.push({
      field: 'roomWidth', severity: 'error',
      message: `${m.roomWidth}ft width is below the 12ft minimum for safe swings.`,
      recommendation: '12ft of lateral clearance is the absolute minimum for a safe swing path.',
    })
  } else if (m.roomWidth < T.roomWidth.recommended) {
    issues.push({
      field: 'roomWidth', severity: 'warning',
      message: `${m.roomWidth}ft provides limited lateral swing room.`,
      recommendation: '14ft+ recommended for comfortable clearance on both sides during a full swing.',
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

  // Ceiling drop mount — recommended when ceiling is high (CLM would sit too far above ideal sensing height)
  if (m.ceilingHeight > 11) {
    list.push({
      name: 'Ceiling Drop Mount',
      category: 'Recommended',
      included: false,
      required: false,
      reason: `Your ${m.ceilingHeight}ft ceiling would place the CLM above the ideal 9–10ft sensing height. A VESA-compatible drop mount pole lowers it to the correct position.`,
      note: 'Available at most AV retailers. Look for a ceiling projector/VESA mount with adjustable drop length.',
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
