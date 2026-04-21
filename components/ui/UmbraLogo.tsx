import { cn } from "@/lib/utils";

interface UmbraLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function UmbraLogo({ size = 28, className, showText = false }: UmbraLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <defs>
          <linearGradient id="umbra-logo-grad" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="15" stroke="url(#umbra-logo-grad)" strokeWidth="1" opacity="0.35" />
        <path
          d="M16 7C16 7 9 11.5 9 17.5C9 20.9853 12.134 24 16 24C19.866 24 23 20.9853 23 17.5C23 11.5 16 7 16 7Z"
          fill="url(#umbra-logo-grad)"
          fillOpacity="0.85"
        />
        <circle cx="16" cy="17" r="2.5" fill="white" fillOpacity="0.95" />
      </svg>
      {showText && (
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-umbra-muted bg-clip-text text-transparent">
          Umbra
        </span>
      )}
    </span>
  );
}
