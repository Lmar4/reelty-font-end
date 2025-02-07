import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings | Reelty",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  redirect("/settings/account");
}
