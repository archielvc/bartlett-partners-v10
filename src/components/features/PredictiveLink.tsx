import { forwardRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface PredictiveLinkProps {
  to: string;
  imageToPreload?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  'data-index'?: number;
}

export const PredictiveLink = forwardRef<HTMLAnchorElement, PredictiveLinkProps>(
  function PredictiveLink(
    { to, imageToPreload, children, className, style, onClick, 'data-index': dataIndex },
    ref
  ) {
    const [hasLoaded, setHasLoaded] = useState(false);

    const handleMouseEnter = () => {
      if (imageToPreload && !hasLoaded) {
        // Create a new Image object to force the browser to download the image
        const img = new Image();
        img.src = imageToPreload;
        img.onload = () => {
          setHasLoaded(true);
        };
      }
    };

    return (
      <Link
        ref={ref}
        to={to}
        className={className}
        style={style}
        onMouseEnter={handleMouseEnter}
        onClick={onClick}
        data-index={dataIndex}
      >
        {children}
      </Link>
    );
  }
);