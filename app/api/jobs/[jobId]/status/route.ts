import { NextResponse } from "next/server";
import { makeBackendRequest } from "@/utils/withAuth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type VideoJobStatus = {
  status: string;
  progress: number;
  metadata?: {
    userMessage?: string;
    error?: string;
  };
};

type StreamController = ReadableStreamDefaultController;

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const jobId = params.jobId;
  const headersList = await headers();
  const authHeader = headersList.get("authorization") || "";

  // Set up SSE headers
  const encoder = new TextEncoder();
  const customHeaders = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };

  try {
    let isStreamActive = true;

    const stream = new ReadableStream({
      start(controller) {
        (async () => {
          while (isStreamActive) {
            try {
              const response = (await makeBackendRequest(`/api/jobs/${jobId}`, {
                method: "GET",
                sessionToken: authHeader,
              })) as Response;

              if (!response || !response.ok) {
                throw new Error("Failed to fetch job status");
              }

              const data = (await response.json()) as VideoJobStatus;

              // Send the update
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
              );

              // If job is complete or failed, close the stream
              if (["COMPLETED", "FAILED"].includes(data.status)) {
                controller.close();
                isStreamActive = false;
                break;
              }

              // Wait before next check
              await new Promise((resolve) => setTimeout(resolve, 2000));
            } catch (error) {
              console.error("[JOB_STATUS_ERROR]", error);
              controller.error(error);
              isStreamActive = false;
              break;
            }
          }
        })();
      },
      cancel() {
        isStreamActive = false;
      },
    });

    // Handle client disconnect
    request.signal.addEventListener("abort", () => {
      isStreamActive = false;
    });

    return new Response(stream, {
      headers: customHeaders,
      status: 200,
    });
  } catch (error) {
    console.error("[SSE_SETUP_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to set up status stream" },
      { status: 500 }
    );
  }
}
