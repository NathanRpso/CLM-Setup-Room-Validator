# PRD — CLM Setup: Room Validator

---

**Document Owner:** @Nathan Aderogba

**Product Name:** Rapsodo Golf CLM PRO

**Target:** Public-facing pre-purchase room compatibility tool for CLM PRO prospects. No account or purchase required.

**Feature Name:** CLM PRO Room Validator

**Jira ID:**

**Prototype:** https://nathanrpso.github.io/clm-setup-room-validator/ *(update when published)*

**Video Walk-Through:**

---

## Table of Contents

- Objectives
- Actors
- Requirements
- Out of Scope
- User Flows
- Success Metrics & Criteria
- Test Cases
- Assumptions & Constraints & Dependencies & Risks
- Engineering Cost
- Development Plan
- Open Questions
- Sign Off

---

## 🎯 Objectives

### Primary Objectives

Help prospective CLM PRO buyers confirm their room is compatible before purchasing, reducing purchase hesitation and post-purchase returns.

### Secondary Objectives

| | |
|---|---|
| Surface required accessories and add-ons at the moment of highest purchase intent | |
| Serve as an optional lead capture opportunity feeding Rapsodo CRM | |
| Enable results to be saved, shared, or revisited via URL | |
| Provide a pathway into the post-purchase setup app (CLM Setup Super App) | |

---

## 👤 Actors

| Actor Name | Actor Behaviour |
|---|---|
| Pre-Purchase Prospect | Home simulator enthusiast researching CLM PRO before buying. Wants to know if their room qualifies and what additional items they need. |
| Gift Buyer / Spouse | Planning a space for someone else. May not have precise measurements. Wants a shareable result link. |
| Rapsodo Sales Rep | Sends a pre-filled validator URL to a prospect as part of a sales conversation. |

---

## 📋 Requirements

| Scope | Requirement | User Story | Priority | Notes |
|---|---|---|---|---|
| WEB | Introduction Screen | As a prospect, I want to understand what the tool does before I start entering measurements, so I know what to prepare. | HIGH | Screen shows brief explanation (2–3 sentences), a visual of the measurement diagram, and a single "Check My Space" CTA. No inputs on this screen. |
| WEB | Room Measurements Form | As a prospect, I want to enter my room dimensions and ceiling type to check compatibility. | HIGH | Fields: ceiling height, room depth (direction of ball flight), room width (side to side), ceiling material. All fields required. |
| WEB | Ceiling Material Selection | As a prospect, I want to select my ceiling type because it affects what hardware I need. | HIGH | Options: Drywall, Concrete / Masonry, Wood / Beam, Other. Button grid (not dropdown). |
| WEB | Unit Toggle (Imperial / Metric) | As a user, I want to enter measurements in my preferred unit system. | HIGH | Global toggle (Imperial / Metric). Persists via localStorage. Converts existing field values on toggle. |
| WEB | Stepper Controls on Measurement Fields | As a user, I want increment / decrement controls so I can adjust values without retyping. | MEDIUM | +/− stepper buttons per field. Clamped to min/max range. Step of 0.5 ft / 0.1 m. |
| WEB | Live 3D Room Diagram | As a user, I want to see a visual diagram update as I type so I can verify I'm measuring correctly. | HIGH | Isometric 3D SVG room illustration. Updates live with field input. Flip/perspective toggle button. Shows ball flight direction, screen/net, and sensing zone legend. |
| WEB | Compatibility Check | As a user, I want to know immediately whether my room meets CLM PRO requirements. | HIGH | Triggered by "Check My Room" button once all fields filled. Inline result rendered below diagram. |
| WEB | Compatible State | As a compatible prospect, I want clear confirmation my room is ready so I can proceed with confidence. | HIGH | Green result card. Summary of entered measurements displayed. Proceed / Shop CTA. |
| WEB | Conditionally Compatible State | As a prospect with a marginal room, I want to understand specific caveats and how to address them. | HIGH | Amber result card. Specific issues listed with guidance (e.g. "drop mount required", "masonry anchor kit needed"). Acknowledgment checkbox required before proceeding. |
| WEB | Not Compatible State | As a prospect with an incompatible room, I want to understand exactly what the problem is and what my options are. | HIGH | Red result card. Blockers listed specifically. Support contact link shown. Alternative product suggestion (MLM2 PRO) shown where applicable. |
| WEB | Compatibility Thresholds | System must apply documented thresholds to classify room measurements. | HIGH | See thresholds table in notes section below. |
| WEB | Component Checklist | As a prospect, I want to know everything I need to buy beyond the CLM PRO unit itself. | HIGH | Generated list based on room inputs. Shown below compatibility verdict. Items: impact screen (required), screen frame (required), mounting bracket (included), ethernet cable (recommended), HDMI cable (required), projector (required if no display), masonry anchor kit (conditional on concrete ceiling), extension bracket (conditional on ceiling < 10.5 ft). |
| WEB | Email Capture | As a prospect, I want to save or email my results checklist for future reference. | MEDIUM | Optional — not required to view results. "Send me this checklist" field. Feeds Rapsodo CRM with: email, measurements, verdict, timestamp, source URL. |
| WEB | URL State | As a user, I want to share or bookmark my results so I can return to them later. | MEDIUM | Measurements encoded in URL params: `?ch=10&rd=18&rw=14&cm=drywall`. Pre-fills form and shows results immediately on return. |
| WEB | Shop CTA | As a compatible prospect, I want a direct path to purchase. | HIGH | Primary CTA: "Shop CLM PRO" — links to product purchase page. |
| WEB | PDF Download | As a prospect, I want a printable version of my results and component checklist. | LOW | Secondary CTA: "Download PDF". Generates printable view of verdict and component list. |
| WEB | Field Inline Tooltips | As a user, I want help text explaining where and how to measure each dimension. | MEDIUM | Tooltip / sub-label per field explaining measurement point (e.g. "from floor to ceiling at the centre of the room above your hitting position"). |

### Compatibility Thresholds

| Measurement | Error Threshold | Warning Threshold | Notes |
|---|---|---|---|
| Ceiling Height | < 8.9 ft (2.7 m) → Not Compatible | > 10.5 ft (3.2 m) → drop mount required | Recommend MLM2 PRO for ceilings below 8.9 ft |
| Room Depth | < 13.8 ft (4.2 m) → Not Compatible | < 16.4 ft (5.0 m) → tight, conditional | Minimum for safe swing and ball flight |
| Room Width | < 9.8 ft (3.0 m) → Not Compatible | < 13.8 ft (4.2 m) → tight, conditional | Minimum side clearance for full swing |
| Ceiling Material: Concrete | — | Warning: masonry anchor kit required | Kit must be purchased separately |
| Ceiling Material: Other | — | Warning: contact support before purchasing | Ceiling load capacity must be verified |

---

## ⛔ Out of Scope

| Scope | Requirement | Explanation | Status |
|---|---|---|---|
| WEB | Account creation or login | Tool is fully anonymous | |
| WEB | Purchase flow embedded in tool | Link out to shop only | |
| WEB | B2B / multi-bay configurations | Handled separately | |
| WEB | Installation instructions | Covered in CLM Setup Install Guide | |
| WEB | Device connectivity or software setup | Covered in CLM Setup Super App | |
| WEB | MLM2 PRO compatibility check | Separate product, different thresholds | FUTURE |

---

## 🔁 User Flows

---

**1 — Compatible Room Check**

User lands on Introduction screen
→ Reads brief explanation of what the tool does
→ Clicks "Check My Space"
→ Enters ceiling height, room depth, room width
→ Selects ceiling material
→ Selects Imperial or Metric unit preference
→ Clicks "Check My Room"
→ Sees green Compatible result card
→ Reviews measurement summary (3-up grid)
→ Reviews component checklist
→ Clicks "Shop CLM PRO"

---

**2 — Conditionally Compatible — Acknowledge and Proceed**

User enters measurements
→ Clicks "Check My Room"
→ Sees amber Conditionally Compatible result card
→ Reads specific issue cards (e.g. "drop mount required", "room depth is tight")
→ Checks acknowledgment checkbox confirming they understand the caveats
→ Continue button enables
→ Reviews component checklist
→ Optionally enters email to save and receive results
→ Clicks "Shop CLM PRO"

---

**3 — Not Compatible Room**

User enters measurements
→ Clicks "Check My Room"
→ Sees red Not Compatible result card
→ Reads specific blocker cards (e.g. "Ceiling too low", "Room too shallow")
→ Sees "We recommend contacting support" link
→ Sees MLM2 PRO alternative product suggestion where applicable
→ Does not proceed to purchase

---

**4 — Return via Saved URL**

User opens a shared or bookmarked URL containing pre-filled measurement params
→ Form auto-populates with saved values
→ Compatibility result shown immediately without re-entering data
→ User reviews result and component checklist
→ Proceeds to Shop or contacts support

---

**5 — Unit Toggle Mid-Entry**

User starts entering values in Imperial
→ Partially fills in ceiling height and room depth
→ Toggles to Metric
→ All entered values convert in place
→ Unit labels update across all fields
→ Diagram updates to reflect metric values
→ User continues entry in Metric

---

**6 — Sales Rep Pre-fill**

Sales rep constructs a URL with the prospect's measurements as params
→ Sends URL to prospect via email or chat
→ Prospect opens URL
→ Form pre-populated with their room dimensions
→ Compatibility result shown immediately
→ Prospect reviews result and component checklist with confidence
→ Clicks "Shop CLM PRO"

---

## 📊 Success Metrics & Criteria

| Goal | Metric & Criteria |
|---|---|
| Reduce pre-purchase room incompatibility | % of purchasers who completed validator and were shown Compatible or Conditional result |
| Reduce returns | Post-purchase return rate (room incompatibility reason) vs. baseline |
| Lead capture | Email capture rate on results screen |
| Purchase intent | Click-through rate from results to Shop page |
| Shareability | Return rate via saved / shared URL |

---

## 🧪 Test Cases

| # | Description | Preconditions | Steps to Execute |
|---|---|---|---|
| 1 | Compatible result renders correctly | All fields filled with valid in-range values | Enter ch=10, rd=18, rw=14, cm=drywall → click Check My Room → verify green Compatible card, measurement summary, and component checklist displayed |
| 2 | Not Compatible result blocks progression | Ceiling height below minimum | Enter ch=7.5, rd=18, rw=14, cm=drywall → check → verify red card, "Ceiling too low" error, Shop CTA hidden |
| 3 | Conditional result requires acknowledgment | Ceiling height above 10.5 ft | Enter ch=11, rd=18, rw=14, cm=drywall → check → verify amber card, drop mount issue card, Next CTA disabled until checkbox checked |
| 4 | Unit toggle converts values correctly | Fields partially filled in Imperial | Enter ch=10, rd=18 → toggle to Metric → verify values convert to 3.0 m and 5.5 m respectively |
| 5 | Concrete ceiling surfaces accessory notice | All fields valid, cm=concrete | Select concrete → check → verify masonry anchor kit listed as required in component checklist |
| 6 | URL state pre-fills form | Valid URL params present | Navigate to ?ch=10&rd=18&rw=14&cm=drywall → verify all fields pre-filled and result shown automatically |
| 7 | Email capture sends to CRM | Results screen visible | Enter email → submit → verify CRM receives email, measurements, verdict, and timestamp |
| 8 | | | |

---

## 🔬 Research

*(TBC — compatibility thresholds to be confirmed with hardware / algo team before launch)*

---

## 🔧 Assumptions & Constraints & Dependencies & Risks

| Assumptions | Constraints |
|---|---|
| Compatibility thresholds are stable and agreed with hardware team | Tool must work without any login or account |
| Email capture feeds an existing CRM endpoint | Must be fully responsive — accessed on desktop and mobile |
| PDF download is a client-side operation (no server render required) | URL params must not break on share across platforms |

| Dependencies | Risks |
|---|---|
| Confirmed compatibility threshold values from hardware team | Thresholds may change — UI must be easy to update |
| CRM endpoint for email capture | Conversion tracking not possible without email or session ID |
| Product page URL for "Shop CLM PRO" CTA | Incorrect thresholds could mislead prospects and increase returns |

---

## 💰 1 — Estimated High-Level Engineering Cost

| Department Name | High-Level Cost |
|---|---|
| Project Management | LOW ☐ MEDIUM ☐ HIGH ☐ |
| App / Cloud Team | LOW ☐ MEDIUM ☐ HIGH ☐ |
| Web Team | LOW ☐ MEDIUM ☐ HIGH ☐ |
| QA Team | LOW ☐ MEDIUM ☐ HIGH ☐ |

---

## 📅 2 — PRD Development Plan

| PRD Name | Estimated Completion Dates | Weeks | | | | | Total Duration (Weeks) |
|---|---|---|---|---|---|---|---|
| | Baseline | Updates | W1 | W2 | W3 | W4 | |
| UI/UX Design | | | | | | | |
| Web Development | | | | | | | |
| QA Test | | | | | | | |
| UAT | | | | | | | |

---

## 💰 3 — Estimated Engineering Cost

| Team Name | Man | Months | Total Man×Months |
|---|---|---|---|
| Project Management | | | |
| UI/UX Design | | | |
| Cloud Development | | | |
| Web Development | | | |
| QA Test | | | |
| UAT | | | |

---

## ❓ Open Questions

| From | To | Question | Answer | Date Answered |
|---|---|---|---|---|
| Nathan | Hardware Team | Confirm final compatibility thresholds (ceiling, depth, width) before launch | | |
| Nathan | Marketing | Should the tool link directly to a specific product page or a landing page? | | |
| Nathan | CRM / Cloud | What endpoint does the email capture POST to? Any rate limiting / spam protection needed? | | |
| Nathan | Design | Is PDF download in scope for v1 or can it be deferred? | | |

---

## ✅ Sign Off

| Name, Surname, Date | Name, Surname, Date |
|---|---|
| | |
