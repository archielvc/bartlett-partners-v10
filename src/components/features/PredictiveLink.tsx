import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface PredictiveLinkProps {
  to: string;
  imageToPreload?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export function PredictiveLink({ 
  to, 
  imageToPreload, 
  children, 
  className, 
  style,
  onClick 
}: PredictiveLinkProps) {
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const handleMouseEnter = () => {
    if (imageToPreload && !hasLoaded) {
      // Create a new Image object to force the browser to download the image
      const img = new Image();
      img.src = imageToPreload;
      img.onload = () => {
        setHasLoaded(true);
        console.log(`✨ Predictively preloaded: ${imageToPreload}`);
      };
    }
  };

  return (
    <Link 
      to={to} 
      className={className} 
      style={style}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}