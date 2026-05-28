import { cn } from "@/lib/utils";

interface UmbraLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: "default" | "compact" | "wordmark";
}

export function UmbraLogo({
  size = 28,
  className,
  showText = false,
  variant = "default",
}: UmbraLogoProps) {
  const gradId = `umbra-logo-grad-${size}`;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <radialGradient id={`${gradId}-glow`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Eclipse veil */}
        <circle cx="16" cy="16" r="15" fill={`url(#${gradId}-glow)`} />
        <circle cx="16" cy="16" r="14.5" stroke={`url(#${gradId})`} strokeWidth="1" opacity="0.4" />

        {/* Sealed shield */}
        <path
          d="M16 5L7 9.5V16.5C7 21.5 11 25.5 16 27C21 25.5 25 21.5 25 16.5V9.5L16 5Z"
          fill={`url(#${gradId})`}
          fillOpacity="0.75"
        />
        <path
          d="M16 8.5C16 8.5 10 12 10 16.5C10 19.5 12.5 22 16 23.5C19.5 22 22 19.5 22 16.5C22 12 16 8.5 16 8.5Z"
          fill="#010409"
          fillOpacity="0.85"
        />

        {/* Encrypted lock core */}
        <rect x="13.5" y="14" width="5" height="4.5" rx="1" fill="#22D3EE" fillOpacity="0.9" />
        <path
          d="M14.5 14V12.5C14.5 11.4 15.2 10.5 16 10.5C16.8 10.5 17.5 11.4 17.5 12.5V14"
          stroke="#22D3EE"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Orbit ring */}
        <ellipse
          cx="16"
          cy="16"
          rx="12"
          ry="5"
          stroke={`url(#${gradId})`}
          strokeWidth="0.6"
          opacity="0.35"
          transform="rotate(-20 16 16)"
        />
      </svg>

      {(showText || variant === "wordmark") && (
        <span
          className={cn(
            "font-bold tracking-tight bg-gradient-to-r from-white via-umbra-cyan/90 to-umbra-violet bg-clip-text text-transparent",
            variant === "compact" ? "text-base" : "text-lg"
          )}
        >
          Umbra
        </span>
      )}
    </span>
  );
}
