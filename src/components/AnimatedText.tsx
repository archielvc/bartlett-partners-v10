import { ReactNode } from "react";

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

// Updated to remove all animations - just pass through children
export function AnimatedText({ 
  children, 
  className = ""
}: AnimatedTextProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Stagger container - just renders children without animation
export function AnimatedStagger({ 
  children,
  className = ""
}: AnimatedTextProps & { stagger?: number }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Stagger item - just renders children without animation
export function AnimatedStaggerItem({ 
  children
}: { children: ReactNode }) {
  return <>{children}</>;
}
