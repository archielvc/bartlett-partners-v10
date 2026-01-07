import { useState, useRef, useEffect, useCallback } from 'react';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface FloorPlanViewerProps {
  src: string;
  alt: string;
}

// Helper to get distance between two touch points
function getTouchDistance(touches: TouchList): number {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Helper to get center point between two touches
function getTouchCenter(touches: TouchList): { x: number; y: number } {
  if (touches.length < 2) {
    return { x: touches[0].clientX, y: touches[0].clientY };
  }
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  };
}

export function FloorPlanViewer({ src, alt }: FloorPlanViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Touch-specific state
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [isPinching, setIsPinching] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(scale);
  const positionRef = useRef(position);

  // Keep refs in sync for use in native event handlers
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.5, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const handleMouseUpWindow = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUpWindow);

    return () => {
      window.removeEventListener('mouseup', handleMouseUpWindow);
    };
  }, []);

  // Native event listeners for wheel and touch (to support non-passive)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Wheel zoom handler
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.min(Math.max(1, prev + delta), 5));
    };

    // Touch start handler
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch start
        e.preventDefault();
        setIsPinching(true);
        setLastTouchDistance(getTouchDistance(e.touches));
      } else if (e.touches.length === 1) {
        // Pan start
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - positionRef.current.x,
          y: e.touches[0].clientY - positionRef.current.y
        });
      }
    };

    // Touch move handler
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch zoom
        e.preventDefault();
        const currentDistance = getTouchDistance(e.touches);

        if (lastTouchDistance !== null) {
          const delta = (currentDistance - lastTouchDistance) * 0.01;
          setScale(prev => Math.min(Math.max(1, prev + delta), 5));
        }
        setLastTouchDistance(currentDistance);
      } else if (e.touches.length === 1 && !isPinching) {
        // Pan (only if not transitioning from pinch)
        if (scaleRef.current > 1) {
          e.preventDefault();
          setPosition({
            x: e.touches[0].clientX - dragStart.x,
            y: e.touches[0].clientY - dragStart.y
          });
        }
      }
    };

    // Touch end handler
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        setIsPinching(false);
        setLastTouchDistance(null);
      }
      if (e.touches.length === 0) {
        setIsDragging(false);
        // Reset position if zoomed all the way out
        if (scaleRef.current <= 1) {
          setPosition({ x: 0, y: 0 });
        }
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [lastTouchDistance, isPinching, dragStart]);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-white">
      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        <button
          onClick={zoomIn}
          className="bg-white/90 hover:bg-[#F3F4F6] p-2 rounded-full shadow-lg transition-colors border border-gray-200"
          style={{ fontFamily: "'Figtree', sans-serif" }}
        >
          <ZoomIn className="w-5 h-5 text-[#1A2551]" />
        </button>
        <button
          onClick={zoomOut}
          className="bg-white/90 hover:bg-[#F3F4F6] p-2 rounded-full shadow-lg transition-colors border border-gray-200"
          style={{ fontFamily: "'Figtree', sans-serif" }}
        >
          <ZoomOut className="w-5 h-5 text-[#1A2551]" />
        </button>
        <button
          onClick={resetZoom}
          className="bg-white/90 hover:bg-[#F3F4F6] p-2 rounded-full shadow-lg transition-colors border border-gray-200"
          style={{ fontFamily: "'Figtree', sans-serif" }}
        >
          <Maximize2 className="w-5 h-5 text-[#1A2551]" />
        </button>
      </div>

      {/* Zoom level indicator */}
      {scale > 1 && (
        <div className="absolute top-4 left-4 z-20 bg-white/90 px-3 py-1.5 rounded shadow-lg border border-gray-100">
          <span
            className="text-[#1A2551]"
            style={{
              fontFamily: "'Figtree', sans-serif",
              fontSize: "0.875rem"
            }}
          >
            {Math.round(scale * 100)}%
          </span>
        </div>
      )}

      {/* Viewport */}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full overflow-hidden relative cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        // Styles to ensure dragging cursor overrides everything
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Content Wrapper - Transformed */}
        <div
          className="w-full h-full flex items-center justify-center origin-center will-change-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s linear' // Faster, linear transition for zoom
          }}
        >
          <ImageWithFallback
            src={src}
            alt={alt}
            // Image naturally fits in the w-full h-full wrapper
            className="max-w-full max-h-full object-contain pointer-events-none select-none"
            style={{ userSelect: 'none' }}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </div>

      {/* Instructions - different for mobile vs desktop */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 px-4 py-2 rounded shadow-lg pointer-events-none border border-gray-100">
        <p
          className="text-[#6B7280] text-center hidden md:block"
          style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: "0.875rem"
          }}
        >
          Scroll to zoom • Drag to pan
        </p>
        <p
          className="text-[#6B7280] text-center md:hidden"
          style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: "0.875rem"
          }}
        >
          Pinch to zoom • Drag to pan
        </p>
      </div>
    </div>
  );
}