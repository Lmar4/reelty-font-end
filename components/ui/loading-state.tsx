import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  text?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  default: "h-6 w-6",
  lg: "h-8 w-8",
};

export function LoadingState({
  text,
  className,
  size = "default",
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center space-y-4 text-center animate-in fade-in-50",
        className
      )}
    >
      <Loader2
        className={cn("animate-spin text-muted-foreground", sizeClasses[size])}
        aria-hidden='true'
      />
      {text && <p className='text-sm text-muted-foreground'>{text}</p>}
    </div>
  );
}
