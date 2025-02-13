
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface JobStatusMessageProps {
  status: { status: string; message: string } | null;
}

export function JobStatusMessage({ status }: JobStatusMessageProps) {
  if (!status) return null;

  const isLoading = status.status === "PROCESSING";
  const variant = status.status === "ERROR" ? "destructive" : "default";

  return (
    <Alert variant={variant} className='mb-8'>
      <div className='flex items-center gap-2'>
        {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
        <AlertDescription className='flex flex-col'>
          <span className='font-semibold'>{status.message}</span>
        </AlertDescription>
      </div>
    </Alert>
  );
}
