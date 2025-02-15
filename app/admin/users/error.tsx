"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <PageHeader
        heading='User Management'
        subheading='View and manage all registered users'
      />

      <Separator className='my-6' />

      <div className='rounded-lg border border-destructive/50 p-8 text-center'>
        <div className='flex justify-center mb-4'>
          <AlertCircle className='h-12 w-12 text-destructive' />
        </div>
        <h2 className='text-xl font-semibold mb-2'>Something went wrong!</h2>
        <p className='text-muted-foreground mb-6'>
          {error.message ||
            "An error occurred while loading the user management page."}
        </p>
        <Button onClick={reset} variant='outline'>
          Try again
        </Button>
      </div>
    </div>
  );
}
