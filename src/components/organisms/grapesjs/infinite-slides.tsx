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
  const innerRef = useRef<HTMLDivElement>(null);

  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [repeatCount, setRepeatCount] = useState(2); // Initial duplication
  const [isDragging, setIsDragging] = useState(false); // Initial duplication

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 1; // multiply to control scroll speed
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

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
      className="relative w-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div
        ref={innerRef}
        className={`
          flex items-center whitespace-nowrap pointer-events-none 
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
            className="relative inline-flex items-center justify-center mx-4 p-2 rounded-lg  flex-shrink-0 pointer-events-none"
            style={{ width: "150px", height: "80px" }}
            aria-hidden={index >= (images || []).length ? "true" : "false"}
          >
            <Image
              src={src}
              fill
              alt={`Partner logo ${index + 1}`}
              className="max-h-full max-w-full object-scale-down pointer-events-none"
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
