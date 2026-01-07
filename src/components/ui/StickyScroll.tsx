import { useRef, useEffect, useState, ReactNode } from 'react';

interface StickyScrollProps {
  children: ReactNode;
  topOffset?: number; // Distance from top when sticky (default 128px = top-32)
  className?: string;
  breakpoint?: number; // Minimum viewport width to enable sticky (default 1024px = lg)
}

/**
 * A sticky scroll component that uses native CSS position:sticky.
 *
 * For CSS sticky to work properly, the parent flex/grid container must have
 * align-items: flex-start (or self-start on this element) so the sticky
 * container doesn't stretch to match sibling height.
 */
export function StickyScroll({
  children,
  topOffset = 128,
  className = '',
  breakpoint = 1024
}: StickyScrollProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if we're on desktop
  useEffect(() => {
    const checkBreakpoint = () => {
      setIsDesktop(window.innerWidth >= breakpoint);
    };
    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, [breakpoint]);

  // On mobile, just render children normally
  if (!isDesktop) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={className}
      style={{
        position: 'sticky',
        top: topOffset,
        alignSelf: 'flex-start', // Critical: prevents stretching in flex container
      }}
    >
      {children}
    </div>
  );
}
