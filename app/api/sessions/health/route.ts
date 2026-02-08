import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit";

/**
 * Session Health Check API
 * Monitors for LLM context corruption and provides auto-recovery
 */

interface SessionHealth {
  sessionKey: string;
  status: "healthy" | "warning" | "corrupted" | "unknown";
  lastActivity: string | null;
  errorCount: number;
  lastError: string | null;
  toolCallMismatchCount: number;
  recommendations: string[];
}

interface HealthStore {
  sessions: Record<string, SessionHealth>;
  lastCheck: string;
}

// In-memory store (would be replaced with proper persistence)
let healthStore: HealthStore = {
  sessions: {},
  lastCheck: new Date().toISOString(),
};

// Known error patterns that indicate context corruption
const CORRUPTION_PATTERNS = [
  /tool_use_id.*mismatch/i,
  /invalid tool_result/i,
  /context.*corrupt/i,
  /message.*history.*invalid/i,
  /unexpected tool_use block/i,
];

/**
 * GET - Check health of all sessions or specific session
 */
export async function GET(request: NextRequest) {
  const sessionKey = request.nextUrl.searchParams.get("sessionKey");

  if (sessionKey) {
    const session = healthStore.sessions[sessionKey] || {
      sessionKey,
      status: "unknown",
      lastActivity: null,
      errorCount: 0,
      lastError: null,
      toolCallMismatchCount: 0,
      recommendations: [],
    };
    return NextResponse.json({ session });
  }

  // Return all sessions with summary
  const sessions = Object.values(healthStore.sessions);
  const summary = {
    total: sessions.length,
    healthy: sessions.filter((s) => s.status === "healthy").length,
    warning: sessions.filter((s) => s.status === "warning").length,
    corrupted: sessions.filter((s) => s.status === "corrupted").length,
    unknown: sessions.filter((s) => s.status === "unknown").length,
  };

  return NextResponse.json({
    summary,
    sessions,
    lastCheck: healthStore.lastCheck,
  });
}

/**
 * POST - Report an error or update session health
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionKey, error, action } = body;

    if (!sessionKey) {
      return NextResponse.json(
        { error: "sessionKey required" },
        { status: 400 }
      );
    }

    // Initialize session if not exists
    if (!healthStore.sessions[sessionKey]) {
      healthStore.sessions[sessionKey] = {
        sessionKey,
        status: "healthy",
        lastActivity: new Date().toISOString(),
        errorCount: 0,
        lastError: null,
        toolCallMismatchCount: 0,
        recommendations: [],
      };
    }

    const session = healthStore.sessions[sessionKey];

    // Handle different actions
    switch (action) {
      case "report_error": {
        session.errorCount++;
        session.lastError = error;
        session.lastActivity = new Date().toISOString();

        // Check if error matches corruption patterns
        const isCorruption = CORRUPTION_PATTERNS.some((pattern) =>
          pattern.test(error)
        );

        if (isCorruption) {
          session.toolCallMismatchCount++;
          if (session.toolCallMismatchCount >= 3) {
            session.status = "corrupted";
            session.recommendations = [
              "Session context appears corrupted",
              "Recommend clearing session history",
              "Auto-recovery triggered if enabled",
            ];
            
            audit.systemEvent("auto-recovery", "session_corruption_detected", {
              sessionKey,
              errorCount: session.toolCallMismatchCount,
            });
          } else {
            session.status = "warning";
            session.recommendations = [
              "Tool call mismatch detected",
              "Monitoring for recurring errors",
            ];
          }
        }
        break;
      }

      case "clear": {
        // Clear session errors (after recovery)
        session.errorCount = 0;
        session.lastError = null;
        session.toolCallMismatchCount = 0;
        session.status = "healthy";
        session.recommendations = [];
        session.lastActivity = new Date().toISOString();
        
        audit.systemEvent("auto-recovery", "session_cleared", { sessionKey });
        break;
      }

      case "heartbeat": {
        session.lastActivity = new Date().toISOString();
        // Reset to healthy if no recent errors
        if (session.errorCount === 0) {
          session.status = "healthy";
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: report_error, clear, heartbeat" },
          { status: 400 }
        );
    }

    healthStore.lastCheck = new Date().toISOString();

    return NextResponse.json({
      success: true,
      session,
      autoRecoveryTriggered: session.status === "corrupted",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove session from health tracking
 */
export async function DELETE(request: NextRequest) {
  const sessionKey = request.nextUrl.searchParams.get("sessionKey");
  
  if (!sessionKey) {
    return NextResponse.json(
      { error: "sessionKey required" },
      { status: 400 }
    );
  }

  if (healthStore.sessions[sessionKey]) {
    delete healthStore.sessions[sessionKey];
    return NextResponse.json({ success: true, message: "Session removed" });
  }

  return NextResponse.json(
    { error: "Session not found" },
    { status: 404 }
  );
}
