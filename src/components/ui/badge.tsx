import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-black",
        secondary: "bg-muted text-muted-foreground border border-border",
        destructive: "bg-destructive text-white",
        outline: "border border-border text-foreground",
        success: "bg-green-500/20 text-green-400 border border-green-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
