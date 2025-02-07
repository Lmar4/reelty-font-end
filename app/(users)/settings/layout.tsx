import Link from "next/link";
import { usePathname } from "next/navigation";

const settingsNavItems = [
  {
    title: "Overview",
    href: "/settings",
  },
  {
    title: "Profile",
    href: "/settings/profile",
  },
  {
    title: "Billing",
    href: "/settings/billing",
  },
  {
    title: "Usage",
    href: "/settings/usage",
  },
  {
    title: "Account",
    href: "/settings/account",
  },
  {
    title: "Subscriptions",
    href: "/settings/subscriptions",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex gap-8'>
        <aside className='w-64 flex-shrink-0'>
          <nav className='space-y-1'>
            {settingsNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <main className='flex-1 min-h-[calc(100vh-8rem)]'>
          <div className='bg-white rounded-lg shadow p-6'>{children}</div>
        </main>
      </div>
    </div>
  );
}
