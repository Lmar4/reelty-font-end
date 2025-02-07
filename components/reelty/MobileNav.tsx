"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Home, Settings } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { userNavigation } from "@/config/navigation";
import Link from "next/link";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"dashboard" | "settings">(
    "dashboard"
  );
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleNavClick = (section: "dashboard" | "settings") => {
    setActiveSection(section);
    setIsOpen(true);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className='fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40'>
        <div className='flex items-center justify-around h-16'>
          <button
            onClick={() => handleNavClick("dashboard")}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive("/dashboard") ? "text-primary" : "text-gray-500"
            }`}
          >
            <Home className='h-6 w-6' />
            <span className='text-xs mt-1'>Dashboard</span>
          </button>
          <button
            onClick={() => handleNavClick("settings")}
            className={`flex flex-col items-center justify-center w-full h-full ${
              pathname.startsWith("/settings")
                ? "text-primary"
                : "text-gray-500"
            }`}
          >
            <Settings className='h-6 w-6' />
            <span className='text-xs mt-1'>Settings</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        {activeSection === "dashboard" ? (
          <div className='space-y-4'>
            <h2 className='text-xl font-semibold'>Dashboard</h2>
            <div className='space-y-2'>
              {userNavigation[0].items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center p-3 rounded-lg ${
                    isActive(item.href)
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon && (
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? "text-white" : "text-gray-400"
                      }`}
                    />
                  )}
                  <div>
                    <div className='font-medium'>{item.title}</div>
                    {item.description && (
                      <p
                        className={`text-sm ${
                          isActive(item.href)
                            ? "text-white/70"
                            : "text-gray-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <h2 className='text-xl font-semibold'>Settings</h2>
            <div className='space-y-2'>
              {userNavigation[1].items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center p-3 rounded-lg ${
                    isActive(item.href)
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon && (
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? "text-white" : "text-gray-400"
                      }`}
                    />
                  )}
                  <div>
                    <div className='font-medium'>{item.title}</div>
                    {item.description && (
                      <p
                        className={`text-sm ${
                          isActive(item.href)
                            ? "text-white/70"
                            : "text-gray-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  );
}
