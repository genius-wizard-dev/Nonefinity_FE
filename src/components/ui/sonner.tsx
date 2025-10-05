import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error:
            "!border-red-500 dark:!border-red-600 [&>div:first-child]:!text-red-600 dark:[&>div:first-child]:!text-red-500",
          success:
            "!border-green-500 dark:!border-green-600 [&>div:first-child]:!text-green-600 dark:[&>div:first-child]:!text-green-500",
          warning:
            "!border-yellow-500 dark:!border-yellow-600 [&>div:first-child]:!text-yellow-600 dark:[&>div:first-child]:!text-yellow-600",
          info: "!border-blue-500 dark:!border-blue-600 [&>div:first-child]:!text-blue-600 dark:[&>div:first-child]:!text-blue-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
