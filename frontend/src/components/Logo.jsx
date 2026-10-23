export default function Logo({ size = "md", dark = false }) {
  const sizes = { sm: "h-7", md: "h-8", lg: "h-10" }
  const textSizes = { sm: "text-base", md: "text-lg", lg: "text-2xl" }
  return (
    <div className={`flex items-center gap-2 ${sizes[size]}`}>
      <svg viewBox="0 0 36 36" fill="none" className={`${sizes[size]} w-auto`}>
        <rect width="36" height="36" rx="9" fill="#2563EB" />
        <path
          d="M7 24 L12 18 L17 21 L22 14 L29 20"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M14 27 L18 27 M18 27 L18 24 M18 24 L22 24 M22 24 L22 27 M22 27 L26 27"
          stroke="#93c5fd"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="29" cy="20" r="2.5" fill="#60a5fa" />
        <circle cx="17" cy="21" r="2" fill="white" />
      </svg>
      <span
        className={`font-bold tracking-tight ${textSizes[size]}`}
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: dark ? "white" : "#0f172a",
        }}
      >
        Career<span>Bridge</span>
      </span>
    </div>
  )
}
