import type { ChatMessage as ChatMessageType } from "../type";
import { ChatMessageItem } from "./ChatMessageItem";

interface ChatMessageProps {
  message: ChatMessageType;
  onApprove?: (
    messageId: string,
    decision: "approve" | "reject" | "edit",
    editedArgs?: Record<string, unknown>
  ) => void;
}

export function ChatMessage({ message, onApprove }: ChatMessageProps) {
  // Use the new ChatMessageItem component that supports streaming, tool calls, etc.
  return <ChatMessageItem message={message} onApprove={onApprove} />;
}
