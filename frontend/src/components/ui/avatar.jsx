import React from "react";
import { cn } from "../../lib/utils";

const AvatarContext = React.createContext({
    imageLoaded: false,
    setImageLoaded: () => {},
});

const Avatar = React.forwardRef(({ className, ...props }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);

    return (
        <AvatarContext.Provider value={{ imageLoaded, setImageLoaded }}>
            <div
                ref={ref}
                className={cn(
                    "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted",
                    className
                )}
                {...props}
            />
        </AvatarContext.Provider>
    );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(
    ({ className, src, alt, ...props }, ref) => {
        const { setImageLoaded } = React.useContext(AvatarContext);

        if (!src) return null;

        return (
            <img
                ref={ref}
                src={src}
                alt={alt}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
                className={cn("aspect-square h-full w-full object-cover", className)}
                {...props}
            />
        );
    }
);
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        const { imageLoaded } = React.useContext(AvatarContext);

        if (imageLoaded) return null;

        return (
            <div
                ref={ref}
                className={cn(
                    "absolute inset-0 flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground font-semibold select-none",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
