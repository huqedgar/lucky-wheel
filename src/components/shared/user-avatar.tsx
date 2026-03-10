"use client";

import { useState } from "react";
import { IconUser } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string;
  email?: string;
  avatar?: string | null;
  className?: string;
  fallbackClassName?: string;
}

function getInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

export function UserAvatar({ name, email, avatar, className, fallbackClassName }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const initials = getInitials(name, email);
  const showImg = avatar && !imgError;

  return (
    <div
      className={cn(
        "relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted select-none",
        className,
      )}
    >
      {showImg ? (
        <img
          key={avatar}
          src={avatar}
          alt={name || email || ""}
          className={cn(
            "h-full w-full object-cover transition-all duration-300",
            imgLoaded ? "blur-0 scale-100" : "scale-110 blur-sm",
          )}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className={cn(
            "flex items-center justify-center text-sm text-muted-foreground",
            fallbackClassName,
          )}
        >
          {initials || <IconUser className="h-4 w-4" />}
        </span>
      )}
    </div>
  );
}
