import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AssetManagementSection from "./_components/asset-management-section";
import type { Asset } from "@/types/asset-types";

async function getInitialAssets(): Promise<Asset[]> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const response = await fetch(`${process.env.BACKEND_URL}/api/admin/assets`, {
    headers: {
      Authorization: `Bearer ${userId}`,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      redirect("/");
    }
    throw new Error("Failed to fetch assets");
  }

  return response.json();
}

export default async function AdminPage() {
  const initialAssets = await getInitialAssets();

  return (
    <main className='container mx-auto py-6'>
      <AssetManagementSection initialAssets={initialAssets} />
    </main>
  );
}
