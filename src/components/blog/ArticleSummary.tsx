import { Clock } from 'lucide-react';

interface ArticleSummaryProps {
  excerpt: string | null;
  tldr?: string | null;
  category: string | null;
  readTime: number | null;
}

export function ArticleSummary({ excerpt, tldr, category, readTime }: ArticleSummaryProps) {
  const summaryText = tldr || excerpt;

  if (!summaryText) return null;

  return (
    <aside
      className="bg-[#f9fafb] border-l-3 border-[#8E8567] rounded-r-lg p-5 md:p-6 mb-8 md:mb-10"
      style={{ borderLeftWidth: '3px' }}
      aria-label="Article summary"
    >
      <h2
        className="text-[#1A2551] text-xs font-bold uppercase tracking-[0.12em] mb-2"
        style={{ fontFamily: "'Figtree', sans-serif" }}
      >
        TL;DR
      </h2>
      <p
        className="text-[#3A3A3A] text-sm md:text-base leading-relaxed mb-3"
        style={{ fontFamily: "'Figtree', sans-serif" }}
      >
        {summaryText}
      </p>
      <div
        className="flex flex-wrap items-center gap-2 text-gray-500 text-[10px] md:text-xs uppercase tracking-wider font-medium"
        style={{ fontFamily: "'Figtree', sans-serif" }}
      >
        {category && (
          <span className="inline-block px-2.5 py-1 border border-[#1A2551]/20 text-[#1A2551] rounded text-[10px] md:text-xs">
            {category}
          </span>
        )}
        {readTime && readTime > 0 && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {readTime} min read
          </span>
        )}
      </div>
    </aside>
  );
}
