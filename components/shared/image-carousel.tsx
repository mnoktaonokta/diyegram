"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { resolveImageSrc, shouldSkipImageOptimization } from "@/lib/utils/image-src";

export function ImageCarousel({
  images,
  altPrefix,
  aspectClass = "aspect-[4/3]",
}: {
  images: string[];
  altPrefix: string;
  aspectClass?: string;
}) {
  const validImages = images
    .map((image) => resolveImageSrc(image))
    .filter((image): image is string => Boolean(image));
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const count = validImages.length;

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  if (count === 0) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center bg-slate-100 text-3xl dark:bg-slate-800",
          aspectClass,
        )}
        aria-hidden
      >
        📸
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent className="ml-0">
          {validImages.map((image, index) => (
            <CarouselItem key={`${image.slice(0, 32)}-${index}`} className="pl-0">
              <div
                className={cn(
                  "relative w-full bg-slate-100 dark:bg-slate-800",
                  aspectClass,
                )}
              >
                <Image
                  src={image}
                  alt={`${altPrefix} ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 448px) 100vw, 448px"
                  unoptimized={shouldSkipImageOptimization(image)}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {count > 1 ? (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {Array.from({ length: count }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "size-1.5 rounded-full transition-all",
                index === current ? "w-4 bg-white" : "bg-white/50",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
