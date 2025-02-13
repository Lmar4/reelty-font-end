import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";

interface ListingBreadcrumbProps {
  address: string;

  onSettingsClick: () => void;
}

export function ListingBreadcrumb({
  address,

  onSettingsClick,
}: ListingBreadcrumbProps) {
  return (
    <div className='mb-8'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Link href='/dashboard' className='hover:text-foreground'>
            Dashboard
          </Link>
          <span>/</span>
          <Link href='/dashboard' className='hover:text-foreground'>
            Listings
          </Link>
          <span>/</span>
          <span className='text-foreground font-medium'>{address}</span>
        </div>
        <Button
          variant='outline'
          size='icon'
          onClick={onSettingsClick}
          title='Settings'
        >
          <Settings className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
