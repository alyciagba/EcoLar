import { useState } from "react";
import { Home } from "lucide-react";

interface SafeConstructionImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function SafeConstructionImage({
  src,
  alt,
  className = "w-full h-48 object-cover",
  fallbackLabel = "Registro fotográfico da obra",
}: SafeConstructionImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Home className="w-7 h-7 text-emerald-700 dark:text-emerald-400 mb-2" strokeWidth={1.75} />
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 px-3 text-center">
          {fallbackLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
