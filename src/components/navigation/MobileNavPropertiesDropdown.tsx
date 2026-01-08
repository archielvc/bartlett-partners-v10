import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAreasWithProperties } from '../../hooks/useAreas';
import { trackNavigation } from '../../utils/analytics';

interface MobileNavPropertiesDropdownProps {
  onNavigate: (page: string) => void;
  index: number;
}

export function MobileNavPropertiesDropdown({
  onNavigate,
  index,
}: MobileNavPropertiesDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { data: areas = [] } = useAreasWithProperties();

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAreaClick = (areaName: string) => {
    trackNavigation(`properties?location=${areaName}`);
    onNavigate('properties');
    navigate(`/properties?location=${areaName}`);
  };

  const handleAllPropertiesClick = () => {
    trackNavigation('properties');
    onNavigate('properties');
    navigate('/properties');
  };

  return (
    <div className="flex flex-col">
      {/* Main Properties button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          delay: 0.1 + (index * 0.05),
          duration: 0.3,
          ease: "easeOut"
        }}
        onClick={handleToggle}
        className="group flex items-center gap-4 text-left"
      >
        <span className="w-12 h-[1px] bg-[#1A2551]/20 group-hover:bg-[#8E8567] group-hover:w-20 transition-all duration-500"></span>
        <span
          className="text-[#1A2551] text-4xl font-medium group-hover:text-[#8E8567] transition-colors duration-500 flex items-center gap-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Properties
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            style={{ marginTop: '0.15em' }}
          />
        </span>
      </motion.button>

      {/* Expandable area list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden mt-3"
            style={{ marginLeft: 'calc(3rem + 1rem)' }}
          >
            <div className="flex flex-col gap-3 py-2">
              {/* All Properties */}
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                onClick={handleAllPropertiesClick}
                className="text-left text-[#1A2551] text-xl font-medium hover:text-[#8E8567] transition-colors duration-300"
                style={{ fontFamily: "'Figtree', sans-serif" }}
              >
                All Properties
              </motion.button>

              {/* Area links */}
              {areas.map((area, areaIndex) => (
                <motion.button
                  key={area}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + (areaIndex + 1) * 0.05 }}
                  onClick={() => handleAreaClick(area)}
                  className="text-left text-[#1A2551]/80 text-lg hover:text-[#8E8567] transition-colors duration-300"
                  style={{ fontFamily: "'Figtree', sans-serif" }}
                >
                  {area}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
