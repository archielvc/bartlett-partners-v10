import { useState, useRef, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface FloorPlanViewerProps {
  src: string;
  alt: string;
}

export function FloorPlanViewer({ src, alt }: FloorPlanViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(1, prev + delta), 5));
  };

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

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 5));
  };

  const zoomOut = () => {
    setScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleMouseUpWindow = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUpWindow);
    return () => window.removeEventListener('mouseup', handleMouseUpWindow);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-white">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={zoomIn}
          className="bg-white/90 hover:bg-white p-2 rounded shadow-lg transition-colors border border-gray-100"
          style={{ fontFamily: "'Figtree', sans-serif" }}
        >
          <ZoomIn className="w-5 h-5 text-[#1A2551]" />
        </button>
        <button
          onClick={zoomOut}
          className="bg-white/90 hover:bg-white p-2 rounded shadow-lg transition-colors border border-gray-100"
          style={{ fontFamily: "'Figtree', sans-serif" }}
        >
          <ZoomOut className="w-5 h-5 text-[#1A2551]" />
        </button>
        <button
          onClick={resetZoom}
          className="bg-white/90 hover:bg-white p-2 rounded shadow-lg transition-colors border border-gray-100"
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
        className="flex-1 w-full h-full overflow-hidden relative cursor-grab active:cursor-grabbing touch-none"
        onWheel={handleWheel}
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

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 px-4 py-2 rounded shadow-lg pointer-events-none border border-gray-100">
        <p
          className="text-[#6B7280] text-center"
          style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: "0.875rem"
          }}
        >
          Scroll to zoom • Drag to pan
        </p>
      </div>
    </div>
  );
}