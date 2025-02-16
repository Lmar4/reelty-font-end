import Link from "next/link";

export default function Footer() {
  return (
<<<<<<< HEAD
    <footer className='hidden md:block border-t py-6 md:py-0 px-4 md:px-6'>
      <div className=' flex h-14 items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          © {new Date().getFullYear()} Reelty. All rights reserved.
=======
    <footer className='border-t py-6 px-4 md:px-6 mt-8 md:mt-0 md:py-0'>
      <div className='max-w-[1200px] mx-auto flex flex-col md:flex-row md:h-14 items-center justify-between gap-4 md:gap-0'>
        <p className='text-sm text-muted-foreground text-center md:text-left'>
          © {new Date().getFullYear()} 021 Media LLC dba Reelty. All rights reserved.
>>>>>>> 8a13445 (first commit)
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
