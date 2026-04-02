import { ArrowDown, CheckCircle } from 'lucide-react'

const specs = [
  { label: 'Rec. ceiling height', value: '10 ft' },
  { label: 'Rec. room depth',     value: '14 ft' },
  { label: 'Rec. room width',     value: '14 ft' },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white border-b border-gray-200">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Red accent top-right */}
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-brand opacity-[0.04] blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-gray-400 text-xs font-medium tracking-widest uppercase">Golf</span>
              <span className="text-gray-300">›</span>
              <span className="text-gray-400 text-xs font-medium tracking-widest uppercase">Products</span>
              <span className="text-gray-300">›</span>
              <span className="text-brand text-xs font-medium tracking-widest uppercase">CLM PRO Room Validator</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-5">
              Will the CLM PRO
              <br />
              <span className="text-brand">fit your space?</span>
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Enter your room dimensions and get an instant compatibility verdict
              — plus a complete list of everything you'll need. Takes under 2 minutes.
            </p>

            {/* Key specs strip */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {specs.map(s => (
                <div key={s.label} className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5">
                  <CheckCircle size={14} className="text-brand shrink-0" />
                  <div>
                    <div className="text-gray-900 text-sm font-bold">{s.value}</div>
                    <div className="text-gray-400 text-[11px]">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#validator"
              className="inline-flex items-center gap-2.5 bg-brand hover:bg-brand-hover text-white font-bold text-sm tracking-wider uppercase px-8 py-4 transition-colors"
            >
              Check My Space
              <ArrowDown size={16} />
            </a>
          </div>

          {/* Right: room illustration */}
          <div className="hidden md:flex justify-center items-center">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 320" className="w-full max-w-[420px]" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Room: back wall */}
      <polygon points="80,40 340,40 340,240 80,240" fill="#F5F5F5" stroke="#DDDDDD" strokeWidth="1.5" />
      {/* Floor */}
      <polygon points="80,240 340,240 390,290 30,290" fill="#EBEBEB" stroke="#DDDDDD" strokeWidth="1.5" />
      {/* Left wall */}
      <polygon points="80,40 30,90 30,290 80,240" fill="#EFEFEF" stroke="#DDDDDD" strokeWidth="1.5" />
      {/* Ceiling */}
      <polygon points="80,40 340,40 390,90 30,90" fill="#F8F8F8" stroke="#DDDDDD" strokeWidth="1.5" />

      {/* Screen on back wall */}
      <rect x="130" y="70" width="160" height="130" rx="2" fill="#F0F0F0" stroke="#CC1B32" strokeWidth="2" />
      <rect x="136" y="76" width="148" height="118" rx="1" fill="#1a2e1a" opacity="0.7" />
      <rect x="136" y="76" width="148" height="118" rx="1" fill="url(#screenGlow)" opacity="0.5" />

      {/* CLM on ceiling */}
      <rect x="194" y="90" width="32" height="20" rx="3" fill="#F0F0F0" stroke="#CCCCCC" strokeWidth="1" />
      <rect x="198" y="94" width="24" height="10" rx="2" fill="#CC1B32" opacity="0.9" />
      <circle cx="210" cy="109" r="3" fill="#EEEEEE" stroke="#AAAAAA" strokeWidth="0.75" />

      {/* Detection cone */}
      <polygon points="210,110 185,233 235,233" fill="#CC1B32" opacity="0.05" />
      <line x1="210" y1="110" x2="185" y2="233" stroke="#CC1B32" strokeWidth="0.75" strokeDasharray="4,3" opacity="0.3" />
      <line x1="210" y1="110" x2="235" y2="233" stroke="#CC1B32" strokeWidth="0.75" strokeDasharray="4,3" opacity="0.3" />

      {/* Ball arc */}
      <path d="M 210 228 Q 250 165 298 138" stroke="#22863a" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.6" />
      <circle cx="298" cy="138" r="4" fill="#22863a" opacity="0.7" />

      {/* Hitting position */}
      <ellipse cx="210" cy="268" rx="15" ry="5" fill="#CC1B32" opacity="0.12" />
      <circle cx="210" cy="263" r="3" fill="#CC1B32" opacity="0.4" />

      {/* Dimension lines */}
      <line x1="55" y1="95" x2="55" y2="285" stroke="#CCCCCC" strokeWidth="1" />
      <line x1="49" y1="95"  x2="61" y2="95"  stroke="#CCCCCC" strokeWidth="1" />
      <line x1="49" y1="285" x2="61" y2="285" stroke="#CCCCCC" strokeWidth="1" />
      <text x="46" y="195" fill="#AAAAAA" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle" transform="rotate(-90 46 195)">CEILING HEIGHT</text>

      <line x1="85" y1="302" x2="335" y2="302" stroke="#CCCCCC" strokeWidth="1" />
      <line x1="85" y1="296" x2="85" y2="308" stroke="#CCCCCC" strokeWidth="1" />
      <line x1="335" y1="296" x2="335" y2="308" stroke="#CCCCCC" strokeWidth="1" />
      <text x="210" y="316" fill="#AAAAAA" fontSize="9" fontFamily="Inter,sans-serif" textAnchor="middle">ROOM DEPTH</text>

      <text x="250" y="103" fill="#999" fontSize="8" fontFamily="Inter,sans-serif">CLM PRO</text>
      <line x1="244" y1="102" x2="228" y2="102" stroke="#CCCCCC" strokeWidth="0.75" />

      <defs>
        <linearGradient id="screenGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d6a2d" />
          <stop offset="100%" stopColor="#0a1a0a" />
        </linearGradient>
      </defs>
    </svg>
  )
}
