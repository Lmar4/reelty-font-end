import { NextResponse } from "next/server";
import { withAuth } from "@/utils/withAuth";

// POST /api/admin/bulk-upload
export const POST = withAuth(async (request) => {
  try {
    const formData = await request.formData();

    const response = await fetch(
      `${process.env.BACKEND_URL}/admin/bulk-upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${request.auth.sessionToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to process bulk upload");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[BULK_UPLOAD_POST]", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process bulk upload",
      },
      { status: 500 }
    );
  }
});
