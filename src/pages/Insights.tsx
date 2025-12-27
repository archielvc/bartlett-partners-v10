
import { InsightsHero } from "../components/insights/InsightsHero";
import { Reveal } from "../components/animations/Reveal";
import { OptimizedImage } from "../components/OptimizedImage";
import { InsightsAreas } from "../components/insights/InsightsAreas";
import { InsightsNewsletter } from "../components/insights/InsightsNewsletter";
import { TestimonialsCarousel } from "../components/TestimonialsCarousel";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { applySEO, PAGE_SEO } from "../utils/seo";
import { getPublishedBlogPostsLight, getPublishedTestimonials, getGlobalSettings } from "../utils/database";
import { trackEvent } from "../utils/analytics";
import type { BlogPost, Testimonial } from "../types/database";

export default function Insights() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [heroImage, setHeroImage] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    applySEO('insights');

    const fetchData = async () => {
      const [blogData, testimonialData, globalSettings] = await Promise.all([
        getPublishedBlogPostsLight(),
        getPublishedTestimonials(),
        getGlobalSettings<Record<string, string>>('page_hero_images').catch(() => ({}))
      ]);
      setBlogPosts(blogData as BlogPost[]);
      setTestimonials(testimonialData);

      const images = globalSettings as Record<string, string> | null;
      if (images && images.insights) {
        setHeroImage(images.insights);
      }
    };

    fetchData();
  }, []);

  const nextSlide = () => {
    if (currentIndex < blogPosts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <main id="main-content">
      {/* Hero Section */}
      <InsightsHero image={heroImage} />

      {/* 1. Latest Articles (Blog Carousel) */}
      <Reveal width="100%">
        <section className="w-full bg-gray-50 px-6 md:px-12 lg:px-20 py-12 md:py-20">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex justify-between items-end mb-8 md:mb-12">
              <h2
                className="text-[#1A2551] text-4xl md:text-5xl"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
              >
                Latest Articles
              </h2>

              {/* Navigation Arrows */}
              <div className="flex gap-3">
                <button
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                  className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center hover:bg-[#1A2551] hover:border-[#1A2551] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[#1A2551]"
                  aria-label="Previous posts"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentIndex >= blogPosts.length - 1}
                  className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center hover:bg-[#1A2551] hover:border-[#1A2551] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[#1A2551]"
                  aria-label="Next posts"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              {blogPosts.length > 0 ? (
                <div
                  className="flex gap-6 transition-transform duration-700 ease-out items-stretch"
                  style={{
                    transform: `translateX(calc(-${currentIndex * 100}% - ${currentIndex * 1.5}rem))`
                  }}
                >
                  {blogPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      onClick={() => {
                        trackEvent('select_content', 'Blog Post', post.title);
                      }}
                      className="flex-shrink-0 w-full md:w-[calc(33.33%-1rem)] cursor-pointer group bg-white transition-all duration-300 flex flex-col h-auto border border-gray-200 rounded-md overflow-hidden hover:shadow-xl hover:border-[#1A2551]/30"
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
                        <div className="absolute top-4 left-4 bg-white px-4 py-2">
                          <span
                            className="text-[#8E8567] text-xs font-bold uppercase tracking-widest"
                            style={{ fontFamily: "'Figtree', sans-serif" }}
                          >
                            {post.category || "Insight"}
                          </span>
                        </div>
                      </div>

                      <div className="p-8 flex flex-col flex-grow">
                        {/* Date */}
                        <div className="mb-4 text-gray-400 text-xs uppercase tracking-wider font-medium">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                            : new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          }
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
              ) : (
                <div className="text-center py-20 bg-gray-100">
                  <p className="text-gray-500">No insights published yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </Reveal>

      {/* 2. Newsletter Sign Up */}
      <Reveal width="100%">
        <InsightsNewsletter />
      </Reveal>

      {/* 3. Explore our neighbourhoods section */}
      <Reveal width="100%" variant="fade-in">
        <InsightsAreas />
      </Reveal>

      {/* Testimonials (Kept at bottom) */}
      <Reveal width="100%">
        <div className="py-12 bg-white">
          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      </Reveal>
    </main>
  );
}
