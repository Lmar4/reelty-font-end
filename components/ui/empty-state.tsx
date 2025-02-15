import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50",
        className
      )}
    >
      {Icon && (
        <div className='rounded-full bg-muted p-3'>
          <Icon className='h-6 w-6 text-muted-foreground' aria-hidden='true' />
        </div>
      )}
      <h3 className='mt-4 text-lg font-semibold'>{title}</h3>
      {description && (
        <p className='mt-2 text-sm text-muted-foreground'>{description}</p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className='mt-4'
          size='sm'
          variant='outline'
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
