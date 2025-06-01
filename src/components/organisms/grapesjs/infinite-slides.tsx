import React, { useMemo } from "react";

export function InfiniteSlides({
  images,
  speed = 30,
  direction = "right",
}: {
  images?: string[];
  speed: number;
  direction: "left" | "right";
}) {
  const duplicatedImages = [...(images || []), ...(images || [])];

  // Compute animation duration based on item count and speed
  const animationDuration = useMemo(() => {
    const durationInSeconds = (duplicatedImages.length * 150) / speed;
    return `${durationInSeconds}s`;
  }, [duplicatedImages.length, speed]);

  return (
    <div className="relative w-full max-w-6xl overflow-hidden bg-white shadow-lg rounded-xl p-4">
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
            className="inline-block mx-4 p-2 bg-gray-50 rounded-lg shadow-sm flex-shrink-0"
            style={{ width: "150px", height: "80px" }}
            aria-hidden={index >= (images || []).length ? "true" : "false"}
          >
            <img
              src={src}
              alt={`Partner logo ${index + 1}`}
              className="w-full h-full object-contain rounded-md"
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
