import React, { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";

export type SlideProps = {
  images?: string[];
  speed: number;
  direction: "left" | "right";
};

export function InfiniteSlides({
  images,
  speed = 30,
  direction = "right",
}: SlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [repeatCount, setRepeatCount] = useState(2); // Initial duplication

  // Compute how many times to duplicate to fill width
  useEffect(() => {
    if (!containerRef.current || images?.length === 0) {
      setRepeatCount(2);
      return;
    }
    const containerWidth = containerRef.current.offsetWidth;
    const imageWidth = 150 + 32; // width + margin (mx-4 = 16px each side)
    const minCount = Math.ceil(
      containerWidth / (imageWidth * (images?.length || 0)),
    );
    setRepeatCount(minCount + 1); // +1 to avoid edge cutoff
  }, [images]);

  const duplicatedImages = useMemo(() => {
    return Array(repeatCount).fill(images).flat();
  }, [images, repeatCount, containerRef]);

  // Compute animation duration based on item count and speed
  const animationDuration = useMemo(() => {
    const durationInSeconds = (duplicatedImages.length * 150) / speed;
    return `${durationInSeconds}s`;
  }, [duplicatedImages.length, speed]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden shadow-lg"
    >
      <div
        className={`
          flex items-center whitespace-nowrap 
          ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}
          hover:[animation-play-state:paused]
        `}
        style={{
          animationDuration,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {duplicatedImages.map((src, index) => (
          <div
            key={index}
            className="relative inline-flex items-center justify-center mx-4 p-2 rounded-lg shadow-sm flex-shrink-0"
            style={{ width: "150px", height: "80px" }}
            aria-hidden={index >= (images || []).length ? "true" : "false"}
          >
            <Image
              src={src}
              fill
              alt={`Partner logo ${index + 1}`}
              className="max-h-full max-w-full object-scale-down"
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/150x80/CCCCCC/666666?text=Error`;
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
