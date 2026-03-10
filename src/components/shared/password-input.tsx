import { ComponentProps, forwardRef, useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PasswordInput = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => setIsVisible((prevState) => !prevState);

    return (
      <div className="relative">
        <Input
          ref={ref}
          className={cn("pe-9", className)}
          type={isVisible ? "text" : "password"}
          {...props}
        />
        <button
          className="absolute inset-y-0 inset-e-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          aria-controls={props.id}
        >
          {isVisible ? (
            <IconEyeOff size={16} strokeWidth={2} aria-hidden="true" />
          ) : (
            <IconEye size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
