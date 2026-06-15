import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white text-card-foreground shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 border-b border-slate-100 px-5 py-4 dark:border-slate-800", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn("text-base font-bold text-slate-800 dark:text-zinc-100", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-slate-500 dark:text-zinc-400", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("space-y-4 px-5 py-4", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("border-t border-slate-100 px-5 py-4 dark:border-slate-800", className)}
      {...props}
    />
  );
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
