import React from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground border-transparent",
                secondary: "bg-secondary text-secondary-foreground border-transparent",
                outline: "text-foreground",
                success: "bg-emerald-600 text-white border-transparent",
                warning: "bg-amber-500 text-white border-transparent",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
    />
));

Badge.displayName = "Badge";

export { Badge, badgeVariants };





import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground border-transparent",
                secondary: "bg-secondary text-secondary-foreground border-transparent",
                outline: "text-foreground",
                success: "bg-emerald-600 text-white border-transparent",
                warning: "bg-amber-500 text-white border-transparent",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
    />
));

Badge.displayName = "Badge";

export { Badge, badgeVariants };




