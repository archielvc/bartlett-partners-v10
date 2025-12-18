interface CharacterCounterProps {
  current: number;
  min?: number;
  optimal: number;
  max?: number;
  className?: string;
}

/**
 * Character Counter with Color Indicators
 * - Red: Exceeds max or way too short
 * - Orange/Yellow: Below optimal range
 * - Green: In optimal range
 */
export function CharacterCounter({ current, min = 0, optimal, max, className = '' }: CharacterCounterProps) {
  const getColor = () => {
    // If there's a max and we exceed it, show red
    if (max && current > max) return 'text-red-600';
    
    // If we're way below minimum (less than 30% of optimal), show red
    if (current < optimal * 0.3) return 'text-red-600';
    
    // If we're below optimal range (30-80% of optimal), show orange
    if (current < optimal * 0.8) return 'text-orange-500';
    
    // If we're in optimal range, show green
    if (current >= optimal * 0.8 && current <= (max || optimal * 1.2)) return 'text-emerald-600';
    
    // If we're slightly over optimal but under max, show orange
    if (!max || current <= max) return 'text-orange-500';
    
    return 'text-emerald-600';
  };

  const displayMax = max || optimal;

  return (
    <span className={`text-xs font-medium ${getColor()} ${className}`}>
      {current}/{displayMax}
    </span>
  );
}
