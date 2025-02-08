import {
  BarChart,
  Building,
  CreditCard,
  FileText,
  HelpCircle,
  Home,
  Layout,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

export const userNavigation = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        href: "/dashboard",
        icon: Home,
        description: "View your dashboard and recent activity",
      },
      {
        title: "Listings",
        href: "/dashboard/listings",
        icon: Building,
        description: "Manage your real estate listings",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Account",
        href: "/settings/account",
        icon: Settings,
        description: "Manage account security and preferences",
      },
      {
        title: "Billing",
        href: "/settings/billing",
        icon: CreditCard,
        description: "Manage subscription and payments",
      },
      {
        title: "Usage",
        href: "/settings/usage",
        icon: BarChart,
        description: "View platform usage and statistics",
      },
    ],
  },
];

export const marketingNavigation = [
  {
    title: "Company",
    items: [
      {
        title: "Home",
        href: "/",
        icon: Home,
        description: "Return to homepage",
      },
      {
        title: "Pricing",
        href: "/pricing",
        icon: CreditCard,
        description: "View our pricing plans and features",
      },
      {
        title: "Terms of Service",
        href: "/terms",
        icon: FileText,
        description: "Read our terms of service",
      },
      {
        title: "Privacy Policy",
        href: "/privacy",
        icon: ShieldCheck,
        description: "View our privacy policy",
      },
      {
        title: "Help",
        href: "/help",
        icon: HelpCircle,
        description: "Get help and support",
      },
    ],
  },
];

export const adminNavigation = [
  {
    title: "Administration",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: Layout,
        description: "Admin dashboard overview",
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
        description: "Manage user accounts",
      },
      {
        title: "Listings",
        href: "/admin/listings",
        icon: Building,
        description: "Manage all listings",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Security",
        href: "/admin/security",
        icon: ShieldCheck,
        description: "System security settings",
      },
      {
        title: "Reports",
        href: "/admin/reports",
        icon: FileText,
        description: "View system reports",
      },
      {
        title: "Support",
        href: "/admin/support",
        icon: MessageSquare,
        description: "User support and tickets",
      },
    ],
  },
];
