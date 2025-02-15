import { NextRequest, NextResponse } from "next/server";
import { makeBackendRequest } from "@/utils/withAuth";
import { logger } from "@/utils/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type VideoJobStatus = {
  status: string;
  progress: number;
  metadata?: {
    userMessage?: string;
    error?: string;
    stage?: string;
    currentFile?: number;
    totalFiles?: number;
  };
};

const POLL_INTERVAL = 10000; // 10 seconds
const MAX_RETRIES = 6;
const MAX_BACKOFF = 30000; // 30 seconds maximum backoff

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<Response> {
  let isStreamActive = true;

  try {
    const { jobId } = await params;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new NextResponse("Unauthorized: Invalid authorization header", {
        status: 401,
      });
    }

    const token = authHeader.split(" ")[1];

    if (!jobId) {
      return new NextResponse("Bad Request: Job ID is required", {
        status: 400,
      });
    }

    logger.info("[JOB_STATUS] Starting status stream", {
      jobId,
      hasToken: !!token,
    });

    // Set up SSE headers
    const encoder = new TextEncoder();
    const customHeaders = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      // Add CORS headers for EventSource
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    const stream = new ReadableStream({
      async start(controller) {
        let retryCount = 0;
        let lastSuccessfulUpdate: string | null = null;

        while (isStreamActive) {
          try {
            const response = await makeBackendRequest(`/api/jobs/${jobId}`, {
              method: "GET",
              sessionToken: token,
            });

            if (!response) {
              throw new Error("No response received from backend");
            }

            const data = response as VideoJobStatus;
            const currentTime = new Date().toISOString();

            // Reset retry count on successful request
            retryCount = 0;
            lastSuccessfulUpdate = currentTime;

            // Send the update in SSE format
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  ...data,
                  timestamp: currentTime,
                })}\n\n`
              )
            );

            logger.debug("[JOB_STATUS] Status update sent", {
              jobId,
              status: data.status,
              progress: data.progress,
            });

            // Check if job is complete
            if (["COMPLETED", "FAILED"].includes(data.status)) {
              logger.info("[JOB_STATUS] Job finished", {
                jobId,
                finalStatus: data.status,
              });
              controller.close();
              isStreamActive = false;
              break;
            }

            // Wait before next check
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            logger.error("[JOB_STATUS] Error fetching status", {
              jobId,
              error: errorMessage,
              retryCount,
              lastSuccessfulUpdate,
            });

            // Send error event to client
            controller.enqueue(
              encoder.encode(
                `event: error\ndata: ${JSON.stringify({
                  error: errorMessage,
                  timestamp: new Date().toISOString(),
                })}\n\n`
              )
            );

            // Check if we should retry
            retryCount++;
            if (retryCount >= MAX_RETRIES) {
              logger.error("[JOB_STATUS] Max retries reached", {
                jobId,
                maxRetries: MAX_RETRIES,
                lastSuccessfulUpdate,
              });
              controller.close();
              isStreamActive = false;
              break;
            }

            // Calculate backoff time with jitter
            const backoff = Math.min(
              1000 * Math.pow(2, retryCount) + Math.random() * 1000,
              MAX_BACKOFF
            );

            await new Promise((resolve) => setTimeout(resolve, backoff));
          }
        }
      },
      cancel() {
        logger.info("[JOB_STATUS] Stream cancelled");
        isStreamActive = false;
      },
    });

    // Handle client disconnect
    request.signal.addEventListener("abort", () => {
      logger.info("[JOB_STATUS] Client disconnected", { jobId });
      isStreamActive = false;
    });

    return new Response(stream, {
      headers: customHeaders,
      status: 200,
    });
  } catch (error) {
    logger.error("[JOB_STATUS] Setup error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to set up status stream",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
