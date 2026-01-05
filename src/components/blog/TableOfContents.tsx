import { useState, useEffect, useMemo } from 'react';
import { List } from 'lucide-react';

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  contentRef?: React.RefObject<HTMLElement>;
}

// Generate a URL-safe slug from text
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// Extract headings from HTML or markdown content
function extractHeadings(content: string): TOCItem[] {
  const headings: TOCItem[] = [];

  // Match HTML headings (h2 and h3)
  const htmlHeadingRegex = /<h([23])[^>]*>([^<]+)<\/h[23]>/gi;
  let match;

  while ((match = htmlHeadingRegex.exec(content)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].trim();
    if (text) {
      headings.push({
        id: slugify(text),
        text,
        level,
      });
    }
  }

  // If no HTML headings found, try markdown headings
  if (headings.length === 0) {
    const lines = content.split('\n');
    for (const line of lines) {
      const mdMatch = line.match(/^(#{2,3})\s+(.+)$/);
      if (mdMatch) {
        const level = mdMatch[1].length;
        const text = mdMatch[2].trim();
        if (text) {
          headings.push({
            id: slugify(text),
            text,
            level,
          });
        }
      }
    }
  }

  return headings;
}

export function TableOfContents({ content, contentRef }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const headings = useMemo(() => extractHeadings(content), [content]);

  // Add IDs to actual DOM headings and observe them
  useEffect(() => {
    if (headings.length === 0) return;

    // Add IDs to headings in the DOM
    const article = contentRef?.current || document.querySelector('article.prose');
    if (!article) return;

    const domHeadings = article.querySelectorAll('h2, h3');
    domHeadings.forEach((heading) => {
      const text = heading.textContent?.trim();
      if (text) {
        const id = slugify(text);
        heading.id = id;
      }
    });

    // Create intersection observer for active section tracking
    const observerOptions = {
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    domHeadings.forEach((heading) => {
      if (heading.id) {
        observer.observe(heading);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings, contentRef]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsExpanded(false);
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Desktop: Sticky Sidebar */}
      <nav
        className="hidden xl:block w-48 shrink-0"
        aria-label="Table of contents"
      >
        <div className="sticky top-28">
          <h4
            className="text-[#1A2551] text-[10px] font-bold uppercase tracking-[0.12em] mb-3"
            style={{ fontFamily: "'Figtree', sans-serif" }}
          >
            In This Article
          </h4>
          <ul className="space-y-1.5">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{ paddingLeft: heading.level === 3 ? '0.75rem' : '0' }}
              >
                <button
                  onClick={() => handleClick(heading.id)}
                  className={`text-left text-xs leading-relaxed transition-colors duration-200 hover:text-[#8E8567] ${
                    activeId === heading.id
                      ? 'text-[#8E8567] font-medium'
                      : 'text-gray-500'
                  }`}
                  style={{ fontFamily: "'Figtree', sans-serif" }}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile: Collapsible Accordion */}
      <div className="xl:hidden mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-[#1A2551] text-xs font-semibold uppercase tracking-wider w-full py-2.5 border-b border-gray-200"
          style={{ fontFamily: "'Figtree', sans-serif" }}
          aria-expanded={isExpanded}
          aria-controls="mobile-toc"
        >
          <List className="w-3.5 h-3.5" />
          Table of Contents
          <span
            className={`ml-auto transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>
        {isExpanded && (
          <ul id="mobile-toc" className="py-3 space-y-2.5 bg-gray-50 px-4 rounded-b-lg">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{ paddingLeft: heading.level === 3 ? '0.75rem' : '0' }}
              >
                <button
                  onClick={() => handleClick(heading.id)}
                  className={`text-left text-xs leading-relaxed transition-colors hover:text-[#8E8567] ${
                    activeId === heading.id
                      ? 'text-[#8E8567] font-medium'
                      : 'text-gray-600'
                  }`}
                  style={{ fontFamily: "'Figtree', sans-serif" }}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
