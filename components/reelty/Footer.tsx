import Link from "next/link";

export default function Footer() {
  return (
    <footer className='hidden md:block border-t py-6 md:py-0 px-4 md:px-6'>
      <div className=' flex h-14 items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          © {new Date().getFullYear()} Reelty. All rights reserved.
        </p>
        <div className='flex items-center gap-4'>
          <Link
            href='/terms'
            className='text-sm text-muted-foreground hover:text-foreground'
          >
            Terms
          </Link>
          <Link
            href='/privacy'
            className='text-sm text-muted-foreground hover:text-foreground'
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
