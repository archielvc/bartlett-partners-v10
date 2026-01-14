import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { OptimizedImage } from '../OptimizedImage';
import { trackEvent } from '../../utils/analytics';
import type { BlogPost } from '../../types/database';

interface FeaturedPostProps {
  post: BlogPost;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <Link
      to={`/insights/${post.slug}`}
      onClick={() => trackEvent('select_content', 'Featured Blog Post', post.title)}
      className="group block mb-8 md:mb-12"
    >
      <div className="flex flex-col md:flex-row bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
        {/* Image - flexbox makes this match content height */}
        <div className="relative aspect-[4/3] md:aspect-auto md:w-1/2 md:shrink-0 overflow-hidden">
          {post.featured_image && (
            <OptimizedImage
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          )}
          <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-md">
            <span
              className="text-[#8E8567] text-sm font-bold uppercase tracking-[0.2em]"
              style={{ fontFamily: "'Figtree', sans-serif" }}
            >
              {post.category || "Insight"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 lg:p-10 md:w-1/2 flex flex-col justify-center">
          {/* Meta */}
          <div
            className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 text-gray-400 text-[10px] md:text-xs uppercase tracking-wider font-medium"
            style={{ fontFamily: "'Figtree', sans-serif" }}
          >
            <span className="text-[#8E8567]">Featured</span>
            <span className="text-gray-300">|</span>
            <span>
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
                : new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
            </span>
            {post.read_time && post.read_time > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {post.read_time} min read
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h2
            className="text-[#1A2551] text-xl md:text-2xl lg:text-3xl mb-3 group-hover:text-[#8E8567] transition-colors leading-snug"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p
              className="text-gray-500 text-sm md:text-base leading-relaxed mb-4 md:mb-5 line-clamp-3 md:line-clamp-4"
              style={{ fontFamily: "'Figtree', sans-serif" }}
            >
              {post.excerpt}
            </p>
          )}

          {/* CTA */}
          <div
            className="flex items-center gap-2 text-[#1A2551] font-semibold text-xs md:text-sm uppercase tracking-wider group-hover:gap-3 transition-all duration-300"
            style={{ fontFamily: "'Figtree', sans-serif" }}
          >
            Read Article <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
