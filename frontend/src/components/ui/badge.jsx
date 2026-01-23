import React from "react";
import { cn } from "../../lib/utils";

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
    const base =
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
    const variants = {
        default: "bg-primary text-primary-foreground border-transparent",
        secondary: "bg-secondary text-secondary-foreground border-transparent",
        outline: "text-foreground",
        success: "bg-emerald-600 text-white border-transparent",
        warning: "bg-amber-500 text-white border-transparent",
    };

    return (
        <div
            ref={ref}
            className={cn(base, variants[variant] || variants.default, className)}
            {...props}
        />
    );
});

Badge.displayName = "Badge";

export { Badge };
