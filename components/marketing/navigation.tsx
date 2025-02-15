"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { marketingNavigation } from "@/config/navigation";

export function MarketingNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className='hidden md:flex items-center space-x-6'>
        {marketingNavigation[0].items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className='md:hidden'>
          <Button variant='ghost' size='icon' className='h-9 w-9 p-0'>
            <Menu className='h-5 w-5' />
            <span className='sr-only'>Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='right' className='w-64'>
          <nav className='flex flex-col space-y-4 mt-4'>
            {marketingNavigation[0].items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-x-2 text-sm font-medium transition-colors hover:text-primary p-2 rounded-md",
                  pathname === item.href
                    ? "bg-muted text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className='h-4 w-4' />
                {item.title}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
