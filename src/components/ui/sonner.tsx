import { useTheme } from "../theme/theme-provider";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",

          success:
            "group-[.toaster]:bg-primary/5 group-[.toaster]:text-primary group-[.toaster]:border-primary/20",
          error:
            "group-[.toaster]:bg-destructive/5 group-[.toaster]:text-destructive group-[.toaster]:border-destructive/20",
          warning:
            "group-[.toaster]:bg-yellow-500/5 group-[.toaster]:text-yellow-600 dark:group-[.toaster]:text-yellow-400 group-[.toaster]:border-yellow-500/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };