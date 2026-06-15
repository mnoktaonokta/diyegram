import Image from "next/image";

import { APP_LOGIN_LOGO_SRC } from "@/lib/constants/branding";
import { shouldSkipImageOptimization } from "@/lib/utils/image-src";
import { cn } from "@/lib/utils";

export function AppLoginLogo({ className }: { className?: string }) {
  return (
    <Image
      src={APP_LOGIN_LOGO_SRC}
      alt="Diyegram"
      width={320}
      height={140}
      priority
      className={cn("mx-auto h-auto w-64 object-contain md:w-80", className)}
      unoptimized={shouldSkipImageOptimization(APP_LOGIN_LOGO_SRC)}
    />
  );
}
