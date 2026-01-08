import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAreasWithProperties } from '../../hooks/useAreas';
import { trackNavigation } from '../../utils/analytics';

interface NavPropertiesDropdownProps {
  textColor: string;
  hoverColor: string;
  onNavigate: (page: string) => void;
  isMobile?: boolean;
}

export function NavPropertiesDropdown({
  textColor,
  hoverColor,
  onNavigate,
  isMobile = false,
}: NavPropertiesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const { data: areas = [] } = useAreasWithProperties();

  // Desktop: hover behavior with delay
  const handleMouseEnter = () => {
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  // Mobile: click behavior
  const handleClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const handleAreaClick = (areaName: string) => {
    trackNavigation(`properties?location=${areaName}`);
    onNavigate('properties');
    setIsOpen(false);
    navigate(`/properties?location=${areaName}`);
  };

  const handleAllPropertiesClick = () => {
    trackNavigation('properties');
    onNavigate('properties');
    setIsOpen(false);
  };

  // Dropdown animation variants
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -8,
      transition: { duration: 0.15 }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.2 }
    }),
  };

  // Desktop dropdown styles
  const navLinkStyle = {
    fontFamily: "'Figtree', sans-serif",
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <button
        onClick={handleClick}
        className={`${textColor} ${hoverColor} transition-colors cursor-pointer group flex items-center gap-1`}
        style={navLinkStyle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="premium-hover relative" data-text="Properties">
          <span>Properties</span>
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
            className="absolute top-full left-0 mt-2 min-w-[200px] bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-50"
            role="menu"
            aria-orientation="vertical"
          >
            {/* All Properties */}
            <motion.div custom={0} variants={itemVariants}>
              <Link
                to="/properties"
                onClick={handleAllPropertiesClick}
                className="block px-4 py-3 text-[#1A2551] hover:bg-gray-50 hover:text-[#8E8567] transition-colors border-b border-gray-100"
                style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
                role="menuitem"
              >
                All Properties
              </Link>
            </motion.div>

            {/* Area Links */}
            {areas.map((area, index) => (
              <motion.div
                key={area}
                custom={index + 1}
                variants={itemVariants}
              >
                <button
                  onClick={() => handleAreaClick(area)}
                  className="w-full text-left px-4 py-3 text-[#1A2551] hover:bg-gray-50 hover:text-[#8E8567] transition-colors"
                  style={{
                    fontFamily: "'Figtree', sans-serif",
                    fontSize: '0.8125rem',
                    letterSpacing: '0.05em',
                  }}
                  role="menuitem"
                >
                  {area}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
