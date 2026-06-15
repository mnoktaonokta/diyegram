import Image from "next/image";
import Link from "next/link";

import { APP_HEADER_LOGO_SRC } from "@/lib/constants/branding";
import { shouldSkipImageOptimization } from "@/lib/utils/image-src";
import { cn } from "@/lib/utils";

export function AppHeaderLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Ana sayfa"
      className={cn("block shrink-0", className)}
    >
      <Image
        src={APP_HEADER_LOGO_SRC}
        alt=""
        width={48}
        height={48}
        className="h-10 w-10 object-contain sm:h-12 sm:w-12"
        unoptimized={shouldSkipImageOptimization(APP_HEADER_LOGO_SRC)}
        priority
      />
    </Link>
  );
}
