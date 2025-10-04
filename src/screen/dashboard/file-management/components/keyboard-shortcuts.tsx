import { Button } from "@/components/ui/button";
import { Command, X } from "lucide-react";

interface KeyboardShortcutsProps {
  onClose: () => void;
}

export function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const shortcuts = [
    { keys: ["⌘", "U"], description: "Upload files" },
    { keys: ["⌘", "A"], description: "Select all / Deselect all files" },
    { keys: ["Escape"], description: "Close modal or deselect files" },
    { keys: ["Delete"], description: "Delete selected files" },
    { keys: ["⌘", "/"], description: "Show keyboard shortcuts" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="mb-6 flex items-center gap-2">
          <Command className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Keyboard Shortcuts
          </h2>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
            >
              <span className="text-sm text-foreground">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="rounded bg-background px-2 py-1 text-xs font-semibold text-foreground shadow-sm ring-1 ring-border"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Press{" "}
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">
            ⌘
          </kbd>{" "}
          or{" "}
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">
            Ctrl
          </kbd>{" "}
          on Windows
        </p>
      </div>
    </div>
  );
}
