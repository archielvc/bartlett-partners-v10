import { trackEvent } from '../../utils/analytics';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  postCounts?: Record<string, number>;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  postCounts,
}: CategoryFilterProps) {
  const handleClick = (category: string | null) => {
    trackEvent('filter', 'Blog Category', category || 'All');
    onCategoryChange(category);
  };

  const baseStyles = `
    px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.12em] font-semibold
    transition-all duration-200 whitespace-nowrap
  `;

  const activeStyles = 'bg-[#1A2551] text-white';
  const inactiveStyles = 'bg-white border border-gray-200 text-[#1A2551] hover:border-[#1A2551]';

  return (
    <div className="mb-8 md:mb-12">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleClick(null)}
          className={`${baseStyles} ${selectedCategory === null ? activeStyles : inactiveStyles}`}
          style={{ fontFamily: "'Figtree', sans-serif" }}
        >
          All
          {postCounts && (
            <span className="ml-1.5 opacity-70">
              ({Object.values(postCounts).reduce((a, b) => a + b, 0)})
            </span>
          )}
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleClick(category)}
            className={`${baseStyles} ${selectedCategory === category ? activeStyles : inactiveStyles}`}
            style={{ fontFamily: "'Figtree', sans-serif" }}
          >
            {category}
            {postCounts?.[category] !== undefined && (
              <span className="ml-1.5 opacity-70">({postCounts[category]})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
