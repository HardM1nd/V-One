import React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        const base =
            "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background";
        const variants = {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            outline:
                "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            destructive:
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        };
        const sizes = {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-md px-3",
            lg: "h-10 rounded-md px-6",
            icon: "h-9 w-9",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    base,
                    variants[variant] || variants.default,
                    sizes[size] || sizes.default,
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
