"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavigationItem {
  title: string;
  href: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

interface InternalNavigationProps {
  sections: NavigationSection[];
  className?: string;
}

export default function InternalNavigation({
  sections,
  className = "",
}: InternalNavigationProps) {
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className={`${className}`}>
      {/* Mobile Navigation */}
      <div className='md:hidden'>
        {sections.map((section) => (
          <div key={section.title} className='space-y-1'>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActiveLink(item.href)
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon && (
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActiveLink(item.href) ? "text-white" : "text-gray-400"
                    }`}
                  />
                )}
                <div>
                  <div className='font-medium'>{item.title}</div>
                  {item.description && (
                    <p
                      className={`text-sm ${
                        isActiveLink(item.href)
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
        ))}
      </div>

      {/* Desktop Navigation */}
      <nav className='hidden md:block' aria-label='Desktop navigation'>
        {sections.map((section) => (
          <div key={section.title} className='space-y-4 mb-8'>
            <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider px-3'>
              {section.title}
            </h3>
            <div className='space-y-1'>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-start p-3 rounded-lg transition-colors ${
                    isActiveLink(item.href)
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon && (
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActiveLink(item.href)
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                  )}
                  <div>
                    <div className='font-medium'>{item.title}</div>
                    {item.description && (
                      <p
                        className={`text-sm ${
                          isActiveLink(item.href)
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
        ))}
      </nav>
    </div>
  );
}
