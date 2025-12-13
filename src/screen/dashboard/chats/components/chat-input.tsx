import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUp, Loader2, Square } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isStreaming = false,
  disabled = false,
  placeholder = "Type your message...",
  className,
}) => {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming || disabled) return;

    onSend(trimmed);
    setInputValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [inputValue, isStreaming, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInputValue(value);

      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = "auto";
      const scrollHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${scrollHeight}px`;
    },
    []
  );

  const canSend = inputValue.trim().length > 0 && !isStreaming && !disabled;

  return (
    <div className={cn("relative", className)}>
      {/* Modern gradient border effect */}
      <div className="relative rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 p-[1px] transition-all duration-300 focus-within:from-primary/40 focus-within:via-primary/30 focus-within:to-primary/40">
        <div className="relative flex items-end gap-2 rounded-2xl bg-background/95 backdrop-blur-sm px-4 py-3">
          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isStreaming || disabled}
              rows={1}
              className={cn(
                "w-full resize-none bg-transparent text-sm leading-relaxed",
                "placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-0",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "max-h-[200px] scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
              )}
              style={{ minHeight: "24px" }}
            />
          </div>

          {/* Send/Stop button */}
          <div className="flex-shrink-0">
            {isStreaming ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={cn(
                  "h-9 w-9 rounded-xl",
                  "bg-destructive/10 hover:bg-destructive/20",
                  "text-destructive",
                  "transition-all duration-200"
                )}
                disabled={disabled}
              >
                <Square className="h-4 w-4 fill-current" />
                <span className="sr-only">Stop generating</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                onClick={handleSubmit}
                disabled={!canSend}
                className={cn(
                  "h-9 w-9 rounded-xl transition-all duration-200",
                  canSend
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {disabled ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
                <span className="sr-only">Send message</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Character counter for long messages */}
      {inputValue.length > 500 && (
        <div className="absolute right-14 bottom-4 text-xs text-muted-foreground/60">
          {inputValue.length} chars
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <div className="absolute right-4 -bottom-6 text-[10px] text-muted-foreground/40 select-none">
        Press{" "}
        <kbd className="px-1 py-0.5 rounded bg-muted/50 font-mono">Enter</kbd>{" "}
        to send
      </div>
    </div>
  );
};
