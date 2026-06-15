import Image from "next/image";

import { APP_LOGIN_LOGO_SRC } from "@/lib/constants/branding";
import { shouldSkipImageOptimization } from "@/lib/utils/image-src";
import { cn } from "@/lib/utils";

export function AppLoginLogo({ className }: { className?: string }) {
  return (
    <Image
      src={APP_LOGIN_LOGO_SRC}
      alt="Diyegram"
      width={224}
      height={96}
      priority
      className={cn("mx-auto h-auto w-52 object-contain", className)}
      unoptimized={shouldSkipImageOptimization(APP_LOGIN_LOGO_SRC)}
    />
  );
}
