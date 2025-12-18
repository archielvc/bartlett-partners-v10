import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface ExpandableVideoProps {
  videoSrc?: string;
  posterSrc?: string;
}

export function ExpandableVideo({ 
  videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  posterSrc = "https://images.unsplash.com/photo-1640109229792-a26a0ee366ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzYyMTMzMDA1fDA&ixlib=rb-4.1.0&q=80&w=1080"
}: ExpandableVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Calculate expansion progress (0 to 1) when scrolling through the middle of the section
  // The video expands as user scrolls through the middle portion
  const expansionProgress = useTransform(
    scrollYProgress,
    [0.2, 0.4, 0.6, 0.8],
    [0, 1, 1, 0]
  );

  // Transform values based on expansion progress
  const scale = useTransform(expansionProgress, [0, 1], [1, 1.5]);
  const borderRadius = useTransform(expansionProgress, [0, 1], [24, 0]);
  const width = useTransform(expansionProgress, [0, 1], ["85%", "100vw"]);
  const height = useTransform(expansionProgress, [0, 1], ["auto", "100vh"]);

  useEffect(() => {
    const unsubscribe = expansionProgress.on('change', (latest) => {
      setIsExpanded(latest > 0.5);
    });

    return () => unsubscribe();
  }, [expansionProgress]);

  // Auto-play when expanded, pause when not
  useEffect(() => {
    if (videoRef.current) {
      if (isExpanded) {
        videoRef.current.play().catch(() => {
          // Autoplay might be blocked, that's okay
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isExpanded]);

  return (
    <div 
      ref={containerRef}
      className="w-full pt-32 md:pt-48 pb-16 md:pb-24 bg-white relative"
      style={{ minHeight: '200vh' }}
    >
      {/* Sticky container that holds the video in place */}
      <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{
            width,
            height,
            borderRadius,
            scale,
            maxWidth: '1400px',
          }}
          className="relative bg-black shadow-2xl mx-auto"
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            poster={posterSrc}
            style={{
              borderRadius: 'inherit',
            }}
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Play indicator overlay when not expanded */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isExpanded ? 0 : 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ borderRadius: 'inherit' }}
          >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
              <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
            </div>
          </motion.div>

          {/* Subtle gradient overlay for better text contrast when needed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isExpanded ? 0.2 : 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30 pointer-events-none"
            style={{ borderRadius: 'inherit' }}
          />
        </motion.div>
      </div>
    </div>
  );
}
