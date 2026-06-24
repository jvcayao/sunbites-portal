import Image from "next/image";

import { cn } from "@/lib/utils";

interface AppLogoProps {
  variant?: "full" | "icon";
  className?: string;
}

export function AppLogo({ variant = "full", className }: AppLogoProps) {
  if (variant === "icon") {
    return (
      <Image
        src="/icon.png"
        alt="Sunbites"
        width={40}
        height={40}
        className={cn("rounded-full", className)}
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/icon.png"
        alt="Sunbites"
        width={40}
        height={40}
        className="rounded-full"
      />
      <div className="flex flex-col">
        <span className="text-base font-bold leading-tight text-foreground">
          Sunbites
        </span>
        <span className="text-xs font-medium leading-tight text-muted-foreground">
          Your Healthy Kitchen
        </span>
      </div>
    </div>
  );
}
