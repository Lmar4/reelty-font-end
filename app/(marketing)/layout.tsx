import { MarketingNav } from "@/components/marketing/navigation";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='relative flex min-h-screen flex-col'>
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container flex h-14 items-center justify-between'>
          <div className='flex items-center gap-2'>
            {/* Add your logo here */}
            <span className='font-semibold'>Reelty</span>
          </div>
          <MarketingNav />
        </div>
      </header>
      <main className='flex-1'>{children}</main>
      <footer className='border-t py-6 md:py-0'>
        <div className='container flex h-14 items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            © {new Date().getFullYear()} Reelty. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
