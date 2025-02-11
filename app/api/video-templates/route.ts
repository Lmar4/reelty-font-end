import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type TemplateWithTiers = {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string | null;
  tiers: string[];
  order: number;
  subscriptionTiers: Array<{
    name: string;
  }>;
};

export async function GET() {
  const session = await auth();

  if (!session?.userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Fetch templates from database
  const dbTemplates = await prisma.template.findMany({
    include: {
      subscriptionTiers: true,
    },
    orderBy: {
      order: "asc",
    },
  });

  // Map database templates to video templates
  const templates = dbTemplates.map((template: TemplateWithTiers) => ({
    id: template.name.toLowerCase().replace(/\s+/g, "_"),
    name: template.name,
    description: template.description,
    thumbnailUrl: template.thumbnailUrl,
    subscriptionTiers: template.subscriptionTiers.map((tier) => ({
      name: tier.name,
    })),
  }));

  return NextResponse.json(templates);
}
