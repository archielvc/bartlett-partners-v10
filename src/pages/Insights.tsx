
import { PageHeader } from "../components/global/PageHeader";

import { OptimizedImage } from "../components/OptimizedImage";
import { InsightsAreas } from "../components/insights/InsightsAreas";
import { InsightsNewsletter } from "../components/insights/InsightsNewsletter";
import { CategoryFilter } from "../components/insights/CategoryFilter";
import { FeaturedPost } from "../components/insights/FeaturedPost";
import { TestimonialsCarousel } from "../components/TestimonialsCarousel";
import { Clock } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { applySEO, PAGE_SEO } from "../utils/seo";
import { getPublishedBlogPostsLight, getPublishedTestimonials, getGlobalSettings } from "../utils/database";
import { trackEvent } from "../utils/analytics";
import type { BlogPost, Testimonial } from "../types/database";

export default function Insights() {
  const [currentPage, setCurrentPage] = useState(1);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const blogGridRef = useRef<HTMLElement>(null);

  useEffect(() => {
    applySEO('insights');

    const fetchData = async () => {
      const [blogData, testimonialData] = await Promise.all([
        getPublishedBlogPostsLight(),
        getPublishedTestimonials()
      ]);
      setBlogPosts(blogData as BlogPost[]);
      setTestimonials(testimonialData);
    };

    fetchData();
  }, []);

  // Extract unique categories and count posts per category
  const { categories, postCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    blogPosts.forEach((post) => {
      if (post.category) {
        counts[post.category] = (counts[post.category] || 0) + 1;
      }
    });
    return {
      categories: Object.keys(counts).sort(),
      postCounts: counts,
    };
  }, [blogPosts]);

  // Filter posts by selected category
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return blogPosts;
    return blogPosts.filter((post) => post.category === selectedCategory);
  }, [blogPosts, selectedCategory]);

  // Featured post (only when showing all posts)
  const featuredPost = !selectedCategory && filteredPosts.length > 0 ? filteredPosts[0] : null;
  const gridPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;

  // Pagination
  const blogsPerPage = 6;
  const totalPages = Math.ceil(gridPosts.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const endIndex = startIndex + blogsPerPage;
  const currentBlogs = gridPosts.slice(startIndex, endIndex);

  // Reset to page 1 when category changes
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Helper function to change page and scroll to top
  const changePage = (newPage: number) => {
    trackEvent('click', 'Pagination', String(newPage));
    setCurrentPage(newPage);

    if (blogGridRef.current) {
      setTimeout(() => {
        if (blogGridRef.current) {
          const element = blogGridRef.current;
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  };

  return (
    <main id="main-content">
      {/* Hero Section */}
      <PageHeader title="Insights" />

      {/* 1. Latest Articles (Blog Grid) */}

      <section ref={blogGridRef} className="w-full bg-gray-50 px-6 md:px-12 lg:px-20 py-12 md:py-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-between items-end mb-8 md:mb-10">
            <div className="flex flex-col items-start gap-2">
              <span className="text-[#8E8567] text-sm tracking-[0.2em] font-bold uppercase" style={{ fontFamily: "'Figtree', sans-serif" }}>
                Our Insights
              </span>
              <h2
                className="text-[#1A2551] text-4xl md:text-5xl"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
              >
                Latest Articles
              </h2>
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              postCounts={postCounts}
            />
          )}

          {/* Featured Post (when showing all) */}
          {featuredPost && <FeaturedPost post={featuredPost} />}

          <div>
            {currentBlogs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {currentBlogs.map((post) => (
                    <Link
                      key={post.id}
                      to={`/insights/${post.slug}`}
                      onClick={() => {
                        trackEvent('select_content', 'Blog Post', post.title);
                      }}
                      className="w-full cursor-pointer group bg-white transition-all duration-300 flex flex-col h-auto border border-gray-200 rounded-md overflow-hidden hover:shadow-xl hover:border-[#1A2551]/30"
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden bg-gray-200 aspect-[4/3]">
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

                      <div className="p-8 flex flex-col flex-grow">
                        {/* Date & Read Time */}
                        <div className="mb-4 text-gray-400 text-xs uppercase tracking-wider font-medium flex items-center gap-2">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                            : new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          }
                          {post.read_time && post.read_time > 0 && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className="flex items-center gap-1.5 leading-none">
                                <Clock className="w-3 h-3" />
                                {post.read_time} min read
                              </span>
                            </>
                          )}
                          <span className="text-gray-300">•</span>
                          <span className="text-[#1A2551] font-bold">
                            By {post.author || 'Bartlett & Partners'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          className="text-[#1A2551] mb-4 group-hover:text-[#8E8567] transition-colors"
                          style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "1.5rem",
                            fontWeight: 400,
                            lineHeight: "1.3"
                          }}
                        >
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        {post.excerpt && (
                          <p
                            className="text-gray-500 line-clamp-3 font-light"
                            style={{
                              fontFamily: "'Figtree', sans-serif",
                              fontSize: "0.9375rem",
                              lineHeight: "1.6"
                            }}
                          >
                            {post.excerpt}
                          </p>
                        )}

                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-20">
                    <button
                      onClick={() => changePage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-8 h-11 flex items-center justify-center rounded-full border transition-all duration-300 ${currentPage === 1
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-gray-300 text-[#1A2551] hover:border-[#1A2551] hover:bg-[#1A2551] hover:text-white cursor-pointer'
                        }`}
                      style={{
                        fontFamily: "'Figtree', sans-serif",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        fontWeight: 600
                      }}
                    >
                      <span className={currentPage !== 1 ? "premium-hover" : ""} data-text="Previous">
                        <span>Previous</span>
                      </span>
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => changePage(page)}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${currentPage === page
                            ? 'bg-[#1A2551] text-white'
                            : 'text-[#1A2551] hover:bg-gray-100'
                            }`}
                          style={{
                            fontFamily: "'Figtree', sans-serif",
                            fontSize: "0.875rem",
                            fontWeight: 600
                          }}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-8 h-11 flex items-center justify-center rounded-full border transition-all duration-300 ${currentPage === totalPages
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-gray-300 text-[#1A2551] hover:border-[#1A2551] hover:bg-[#1A2551] hover:text-white cursor-pointer'
                        }`}
                      style={{
                        fontFamily: "'Figtree', sans-serif",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        fontWeight: 600
                      }}
                    >
                      <span className={currentPage !== totalPages ? "premium-hover" : ""} data-text="Next">
                        <span>Next</span>
                      </span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-gray-100">
                <p className="text-gray-500">No insights published yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* 2. Newsletter Sign Up */}
      <InsightsNewsletter />

      {/* 3. Explore our neighbourhoods section */}
      <InsightsAreas />

      {/* Testimonials (Kept at bottom) */}
      <div className="py-12 bg-white">
        <TestimonialsCarousel testimonials={testimonials} />
      </div>
    </main>
  );
}
