import {
  Settings,
  CreditCard,
  BarChart,
  Building,
  Users,
  MessageSquare,
  FileText,
  ShieldCheck,
  Layout,
  Home,
  Briefcase,
  Mail,
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
        title: "Properties",
        href: "/properties",
        icon: Building,
        description: "Manage your real estate properties",
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
    title: "Marketing",
    items: [
      {
        title: "Overview",
        href: "/marketing",
        icon: Layout,
        description: "Marketing dashboard overview",
      },
      {
        title: "Campaigns",
        href: "/marketing/campaigns",
        icon: Briefcase,
        description: "Manage marketing campaigns",
      },
      {
        title: "Communications",
        href: "/marketing/communications",
        icon: Mail,
        description: "Email and message campaigns",
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
        title: "Properties",
        href: "/admin/properties",
        icon: Building,
        description: "Manage all properties",
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
