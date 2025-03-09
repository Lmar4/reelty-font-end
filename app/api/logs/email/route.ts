import { NextResponse } from "next/server";

// Simple in-memory log storage for development
const emailLogs: Array<{
  userId: string;
  emailType: string;
  success: boolean;
  error?: string;
  timestamp: string;
}> = [];

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, emailType, success, error, timestamp } = data;

    // Store log in memory (for development)
    emailLogs.push({
      userId,
      emailType,
      success,
      error,
      timestamp: timestamp || new Date().toISOString(),
    });

    // Log to console for development visibility
    if (success) {
      console.log(`📧 Email sent: ${emailType} to user ${userId}`);
    } else {
      console.error(`❌ Email failed: ${emailType} to user ${userId}`, error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging email:", error);
    return NextResponse.json({ error: "Failed to log email" }, { status: 500 });
  }
}

// For development: endpoint to retrieve logs
export async function GET() {
  return NextResponse.json({ logs: emailLogs });
}
