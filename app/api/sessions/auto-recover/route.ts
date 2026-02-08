import { NextRequest, NextResponse } from "next/server";
import { audit } from "@/lib/audit";

/**
 * Auto-Recovery API for LLM Context Corruption
 * 
 * This endpoint provides:
 * 1. Pre-flight validation of tool call/result pairs
 * 2. Detection of tool_use_id mismatch errors
 * 3. Auto-clear recommendations for corrupted sessions
 */

interface ToolCall {
  id: string;
  name: string;
  timestamp?: string;
}

interface ToolResult {
  tool_use_id: string;
  content: unknown;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  mismatches: { callId: string; resultId: string }[];
  orphanedCalls: string[];
  orphanedResults: string[];
  recommendation: "ok" | "warn" | "clear_session";
}

/**
 * POST - Validate tool call/result pairs before sending to LLM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionKey, toolCalls, toolResults, errorMessage } = body;

    switch (action) {
      case "validate": {
        const result = validateToolPairs(toolCalls || [], toolResults || []);
        
        if (!result.valid) {
          audit.systemEvent("auto-recovery", "validation_failed", {
            sessionKey,
            errors: result.errors,
            recommendation: result.recommendation,
          });
        }

        return NextResponse.json(result);
      }

      case "analyze_error": {
        const analysis = analyzeError(errorMessage || "");
        
        if (analysis.isCorruption) {
          audit.systemEvent("auto-recovery", "corruption_detected", {
            sessionKey,
            errorType: analysis.errorType,
            confidence: analysis.confidence,
          });
        }

        return NextResponse.json(analysis);
      }

      case "get_recovery_steps": {
        return NextResponse.json({
          steps: [
            {
              step: 1,
              action: "pause_agent",
              description: "Pause the affected agent to prevent further corruption",
            },
            {
              step: 2,
              action: "export_context",
              description: "Export current session context for debugging (optional)",
            },
            {
              step: 3,
              action: "clear_session",
              description: "Clear the session history to reset context",
              command: "POST /api/sessions/health { sessionKey, action: 'clear' }",
            },
            {
              step: 4,
              action: "resume_agent",
              description: "Resume the agent with fresh context",
            },
            {
              step: 5,
              action: "verify_health",
              description: "Verify session health after recovery",
              command: "GET /api/sessions/health?sessionKey=...",
            },
          ],
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: validate, analyze_error, get_recovery_steps" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

function validateToolPairs(
  toolCalls: ToolCall[],
  toolResults: ToolResult[]
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    mismatches: [],
    orphanedCalls: [],
    orphanedResults: [],
    recommendation: "ok",
  };

  const callIds = new Set(toolCalls.map((c) => c.id));
  const resultIds = new Set(toolResults.map((r) => r.tool_use_id));

  // Find tool calls without matching results
  for (const call of toolCalls) {
    if (!resultIds.has(call.id)) {
      result.orphanedCalls.push(call.id);
      result.warnings.push("Tool call '" + call.name + "' (" + call.id + ") has no result");
    }
  }

  // Find results without matching tool calls
  for (const res of toolResults) {
    if (!callIds.has(res.tool_use_id)) {
      result.orphanedResults.push(res.tool_use_id);
      result.errors.push("Tool result references unknown call: " + res.tool_use_id);
      result.valid = false;
    }
  }

  // Check for ID mismatches (same index but different IDs)
  const minLen = Math.min(toolCalls.length, toolResults.length);
  for (let i = 0; i < minLen; i++) {
    if (toolCalls[i].id !== toolResults[i].tool_use_id) {
      result.mismatches.push({
        callId: toolCalls[i].id,
        resultId: toolResults[i].tool_use_id,
      });
    }
  }

  // Determine recommendation
  if (result.errors.length > 0 || result.mismatches.length > 2) {
    result.recommendation = "clear_session";
  } else if (result.warnings.length > 0 || result.mismatches.length > 0) {
    result.recommendation = "warn";
  }

  return result;
}

function analyzeError(errorMessage: string): {
  isCorruption: boolean;
  errorType: string | null;
  confidence: number;
  details: string;
} {
  const patterns = [
    { pattern: /tool_use_id.*mismatch/i, type: "tool_use_id_mismatch", confidence: 0.95 },
    { pattern: /invalid tool_result/i, type: "invalid_tool_result", confidence: 0.9 },
    { pattern: /unexpected tool_use block/i, type: "unexpected_tool_use", confidence: 0.9 },
    { pattern: /context.*corrupt/i, type: "context_corruption", confidence: 0.85 },
    { pattern: /message.*history.*invalid/i, type: "history_invalid", confidence: 0.8 },
    { pattern: /tool_result.*without.*tool_use/i, type: "orphaned_result", confidence: 0.95 },
  ];

  for (const { pattern, type, confidence } of patterns) {
    if (pattern.test(errorMessage)) {
      return {
        isCorruption: true,
        errorType: type,
        confidence,
        details: "Detected " + type + " pattern in error message",
      };
    }
  }

  return {
    isCorruption: false,
    errorType: null,
    confidence: 0,
    details: "No known corruption patterns detected",
  };
}
