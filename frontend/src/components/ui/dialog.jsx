import React from "react";
import { cn } from "../../lib/utils";

// Простые заглушки диалога вместо Radix Dialog
const Dialog = ({ children }) => <>{children}</>;
const DialogTrigger = ({ children }) => <>{children}</>;
const DialogPortal = ({ children }) => <>{children}</>;
const DialogClose = ({ children }) => <>{children}</>;

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/60",
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <div
            ref={ref}
            className={cn(
                "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-background p-6 shadow-lg sm:rounded-lg",
                className
            )}
            {...props}
        >
            {children}
        </div>
    </DialogPortal>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }) => (
    <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props}
    />
);

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
DialogTitle.displayName = "DialogTitle";

export {
    Dialog,
    DialogTrigger,
    DialogPortal,
    DialogClose,
    DialogOverlay,
    DialogContent,
    DialogHeader,
    DialogTitle,
};




