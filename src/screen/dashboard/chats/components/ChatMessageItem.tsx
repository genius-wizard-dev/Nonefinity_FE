import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Edit, XCircle } from "lucide-react";
import type { ChatMessage } from "../type";

interface ChatMessageItemProps {
  message: ChatMessage;
  onApprove?: (
    messageId: string,
    decision: "approve" | "reject" | "edit",
    editedArgs?: Record<string, unknown>
  ) => void;
}

export function ChatMessageItem({ message, onApprove }: ChatMessageItemProps) {
  // User message
  if (message.role === "user") {
    return (
      <Message from="user">
        <MessageAvatar src="/api/placeholder/32/32" name="User" />
        <MessageContent variant="contained">{message.content}</MessageContent>
      </Message>
    );
  }

  // Assistant text message (including messages without message_type for backwards compatibility)
  if (
    (message.message_type === "text" || !message.message_type) &&
    message.role === "assistant"
  ) {
    return (
      <Message from="assistant">
        <MessageAvatar src="/api/placeholder/32/32" name="AI" />
        <MessageContent variant="flat">
          <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <Response>{message.content}</Response>
          </div>
        </MessageContent>
      </Message>
    );
  }

  // Tool call message
  if (message.message_type === "tool_call") {
    const toolName = message.metadata?.tool_name || "Unknown Tool";
    const args = (message.metadata?.args as Record<string, unknown>) || {};
    const status = message.metadata?.status || "pending";

    return (
      <Message from="assistant">
        <MessageContent variant="flat" className="w-full">
          <Tool defaultOpen>
            <ToolHeader
              title={`Tool: ${toolName}`}
              type="tool-call"
              state={
                status === "completed" ? "output-available" : "input-available"
              }
            />
            <ToolContent>
              <ToolInput input={args} />
            </ToolContent>
          </Tool>
        </MessageContent>
      </Message>
    );
  }

  // Tool result message
  if (message.message_type === "tool_result") {
    const toolName = message.metadata?.tool_name || "Unknown Tool";
    const result = message.metadata?.result || message.content;
    const status = message.metadata?.status || "completed";

    // Format result - if it's too long, show in expandable tool
    const shouldShowInTool = result.length > 500;

    if (shouldShowInTool) {
      return (
        <Message from="assistant">
          <MessageContent variant="flat" className="w-full">
            <Tool defaultOpen={false}>
              <ToolHeader
                title={`Result: ${toolName}`}
                type="tool-result"
                state="output-available"
              />
              <ToolContent>
                <ToolOutput output={result} errorText={undefined} />
              </ToolContent>
            </Tool>
          </MessageContent>
        </Message>
      );
    }

    // For short results, show inline
    return (
      <Message from="assistant">
        <MessageAvatar src="/api/placeholder/32/32" name="AI" />
        <MessageContent variant="flat">
          <div className="text-sm space-y-2">
            <Badge variant="secondary" className="text-xs">
              {toolName}
            </Badge>
            <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <Response>{result}</Response>
            </div>
          </div>
        </MessageContent>
      </Message>
    );
  }

  // Approval request message
  if (message.message_type === "approval_request") {
    const toolName = message.metadata?.tool_name || "Unknown Tool";
    const args = (message.metadata?.args as Record<string, unknown>) || {};
    const description = message.metadata?.description || "";
    const allowedDecisions = (message.metadata
      ?.allowed_decisions as string[]) || ["approve", "reject"];

    return (
      <Message from="assistant">
        <MessageContent variant="flat" className="w-full">
          <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  Approval Required
                </h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-yellow-700 dark:text-yellow-300"
                  >
                    {toolName}
                  </Badge>
                </div>

                {description && (
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {description}
                  </p>
                )}

                <div className="mt-2 p-3 bg-white dark:bg-gray-900 rounded-md border">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Parameters:
                  </p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(args, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex gap-2">
                {allowedDecisions.includes("approve") && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onApprove?.(message.id, "approve")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}

                {allowedDecisions.includes("reject") && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onApprove?.(message.id, "reject")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                )}

                {allowedDecisions.includes("edit") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onApprove?.(message.id, "edit", args)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </MessageContent>
      </Message>
    );
  }

  // Fallback for unknown message types
  return (
    <Message from={message.role}>
      <MessageContent>
        <p className="text-sm text-gray-500">
          Unknown message type: {message.message_type}
        </p>
      </MessageContent>
    </Message>
  );
}
