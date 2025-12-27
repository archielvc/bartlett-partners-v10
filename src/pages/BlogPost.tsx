import { Navigation } from "../components/Navigation";
import { Reveal } from "../components/animations/Reveal";
import { OptimizedImage } from "../components/OptimizedImage";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { getBlogPostBySlug, getPublishedBlogPostsLight } from "../utils/database";
import type { BlogPost as DBBlogPost } from "../types/database";
import { updateSEO, injectSchema, SchemaGenerator } from "../utils/seo";
import { trackEvent, trackBlogView } from "../utils/analytics";

export default function BlogPost() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<DBBlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<DBBlogPost[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      const postData = await getBlogPostBySlug(slug);
      setPost(postData);

      if (postData) {
        // Track View
        trackBlogView(postData.slug, postData.title);

        // Update SEO tags
        updateSEO({
          title: `${postData.title} - Bartlett & Partners Insights`,
          description: postData.excerpt || postData.content.substring(0, 160),
          ogImage: postData.featured_image,
          type: 'article',
          publishedTime: postData.published_at || postData.created_at,
          author: 'Bartlett & Partners'
        });

        // Inject Schema
        injectSchema(SchemaGenerator.article({
          headline: postData.title,
          image: postData.featured_image,
          datePublished: postData.published_at || postData.created_at,
          description: postData.excerpt || postData.content.substring(0, 160),
          author: 'Bartlett & Partners'
        }));
      }

      // Fetch related posts (lightweight - no content needed)
      const allPosts = await getPublishedBlogPostsLight();
      const related = allPosts
        .filter(p => p.id !== postData?.id)
        .sort((a, b) => {
          const dateA = new Date(a.published_at || a.created_at).getTime();
          const dateB = new Date(b.published_at || b.created_at).getTime();
          return dateB - dateA;
        })
        .slice(0, 3);
      setRelatedPosts(related as DBBlogPost[]);
    };

    fetchPost();
  }, [slug]);

  if (!post) {
    return (
      <>
        <Navigation currentPage="blogPost" />
        <main id="main-content" className="pt-24 md:pt-48 pb-20 px-6 md:px-12 lg:px-20">
          <div className="max-w-[1600px] mx-auto text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation currentPage="blogPost" />

      <main id="main-content">
        {/* Hero Section */}
        <section className="w-full bg-white pt-24 md:pt-32 pb-12 md:pb-20 px-6 md:px-12 lg:px-20">
          <div className="max-w-[1600px] mx-auto">
            {/* Back Button */}
            <Reveal variant="fade-in" duration={0.5}>
              <Link
                to="/insights"
                onClick={() => {
                  trackEvent('navigation_click', { destination: 'insights', location: 'blog_post_back' });
                }}
                className="flex items-center gap-2 text-[#1A2551] mb-6 md:mb-10 hover:opacity-70 transition-opacity group cursor-pointer w-fit"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span
                  style={{
                    fontFamily: "'Figtree', sans-serif",
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: 600
                  }}
                >
                  Back to Insights
                </span>
              </Link>
            </Reveal>

            <div className="max-w-5xl">
              {/* Date & Category */}
              <Reveal width="100%" delay={0.2}>
                <div className="mb-6 md:mb-8 flex flex-wrap items-center gap-3 md:gap-4">
                  {post.category && (
                    <span className="inline-block px-3 py-1 border border-[#1A2551]/20 text-[#1A2551] text-[10px] uppercase tracking-[0.2em] font-medium">
                      {post.category}
                    </span>
                  )}
                  <span
                    className="text-[#6B7280] flex items-center gap-2 uppercase tracking-wider text-xs font-medium"
                    style={{ fontFamily: "'Figtree', sans-serif" }}
                  >
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    }
                  </span>
                  {post.read_time && post.read_time > 0 && (
                    <span
                      className="text-[#6B7280] flex items-center gap-1.5 uppercase tracking-wider text-xs font-medium"
                      style={{ fontFamily: "'Figtree', sans-serif" }}
                    >
                      <span className="text-gray-300">•</span>
                      <Clock className="w-3.5 h-3.5" />
                      {post.read_time} min read
                    </span>
                  )}
                </div>
              </Reveal>

              {/* Title */}
              <Reveal width="100%" delay={0.3}>
                <h1
                  className="text-[#1A2551] mb-8 md:mb-10 text-4xl md:text-6xl leading-[1.1] font-light"
                  style={{
                    fontFamily: "'Playfair Display', serif"
                  }}
                >
                  {post.title}
                </h1>
              </Reveal>

              {/* Excerpt */}
              {post.excerpt && (
                <Reveal width="100%" delay={0.4}>
                  <p
                    className="text-[#3A3A3A] mb-12 md:mb-16 text-lg md:text-xl font-light leading-relaxed max-w-3xl"
                    style={{ fontFamily: "'Figtree', sans-serif" }}
                  >
                    {post.excerpt}
                  </p>
                </Reveal>
              )}
            </div>

            {/* Featured Image */}
            {post.featured_image && (
              <Reveal width="100%" delay={0.5}>
                <div className="relative w-full mb-16 md:mb-24 overflow-hidden bg-gray-100 aspect-[16/9] md:aspect-[21/9]">
                  <OptimizedImage
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Reveal>
            )}
          </div>
        </section>

        {/* Article Content */}
        <section className="w-full bg-white pb-20 md:pb-32 px-6 md:px-12 lg:px-20">
          <div className="max-w-[1600px] mx-auto">
            <div className="max-w-5xl mx-auto">
              {/* Main Content */}
              <Reveal width="100%" delay={0.6}>
                <article className="prose max-w-none">
                  <style>{`
                      /* Blog Article Styles */
                      article.prose {
                        font-family: 'Figtree', sans-serif;
                        color: #3A3A3A;
                        line-height: 1.8;
                      }
                      
                      article.prose h1, 
                      article.prose h2, 
                      article.prose h3, 
                      article.prose h4, 
                      article.prose h5, 
                      article.prose h6 {
                        font-family: 'Playfair Display', serif !important;
                        color: #1A2551 !important;
                        font-weight: 400 !important;
                        line-height: 1.3 !important;
                      }
                      
                      article.prose h1 {
                        font-size: 2.5rem !important;
                        margin-top: 0 !important;
                        margin-bottom: 1.5rem !important;
                      }
                      
                      article.prose h2 {
                        font-size: 2rem !important;
                        margin-top: 3rem !important;
                        margin-bottom: 1.5rem !important;
                        padding-top: 1.5rem !important;
                        border-top: 1px solid #e5e7eb !important;
                      }
                      
                      article.prose h3 {
                        font-size: 1.5rem !important;
                        margin-top: 2rem !important;
                        margin-bottom: 1rem !important;
                      }
                      
                      article.prose h4 {
                        font-size: 1.25rem !important;
                        margin-top: 1.5rem !important;
                        margin-bottom: 0.75rem !important;
                      }
                      
                      article.prose p {
                        font-size: 1.125rem !important;
                        line-height: 1.8 !important;
                        margin-bottom: 1.5rem !important;
                        color: #3A3A3A !important;
                      }
                      
                      article.prose strong {
                        color: #1A2551 !important;
                        font-weight: 600 !important;
                      }
                      
                      article.prose em {
                        font-style: italic !important;
                      }
                      
                      article.prose a {
                        color: #8E8567 !important;
                        text-decoration: underline !important;
                        text-underline-offset: 4px !important;
                        transition: color 0.2s ease !important;
                      }
                      
                      article.prose a:hover {
                        color: #1A2551 !important;
                      }
                      
                      article.prose ul {
                        list-style-type: disc !important;
                        padding-left: 2rem !important;
                        margin-top: 2rem !important;
                        margin-bottom: 2rem !important;
                      }
                      
                      article.prose ol {
                        list-style-type: decimal !important;
                        padding-left: 2rem !important;
                        margin-top: 2rem !important;
                        margin-bottom: 2rem !important;
                      }
                      
                      article.prose li {
                        display: list-item !important;
                        font-size: 1.125rem !important;
                        line-height: 1.8 !important;
                        margin-bottom: 0.75rem !important;
                        color: #3A3A3A !important;
                      }
                      
                      article.prose blockquote {
                        border-left: 4px solid #8E8567 !important;
                        padding-left: 1.5rem !important;
                        padding-top: 1rem !important;
                        padding-bottom: 1rem !important;
                        margin: 2rem 0 !important;
                        font-style: italic !important;
                        color: #3A3A3A !important;
                        background-color: #f9fafb !important;
                        border-radius: 0 0.5rem 0.5rem 0 !important;
                      }
                      
                      article.prose img {
                        border-radius: 0.75rem !important;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
                        margin: 2rem 0 !important;
                      }
                      
                      @media (min-width: 768px) {
                        article.prose h1 { font-size: 3rem !important; }
                        article.prose h2 { font-size: 2.25rem !important; }
                        article.prose h3 { font-size: 1.875rem !important; }
                        article.prose p, article.prose li { font-size: 1.25rem !important; }
                      }
                    `}</style>
                  {post.content ? (
                    // Check if content contains HTML tags
                    post.content.includes('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    ) : (
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => <h1 {...props} />,
                          h2: ({ node, ...props }) => <h2 {...props} />,
                          h3: ({ node, ...props }) => <h3 {...props} />,
                          h4: ({ node, ...props }) => <h4 {...props} />,
                          p: ({ node, ...props }) => <p {...props} />,
                          li: ({ node, ...props }) => <li {...props} />,
                          a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
                        }}
                      >
                        {post.content}
                      </ReactMarkdown>
                    )
                  ) : (
                    <p className="text-gray-500 italic">No content available.</p>
                  )}
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="w-full bg-gray-50 py-20 md:py-32 px-6 md:px-12 lg:px-20">
            <div className="max-w-[1600px] mx-auto">
              <Reveal width="100%" delay={0.7}>
                <div className="flex justify-between items-end mb-12">
                  <h2
                    className="text-[#1A2551] text-4xl md:text-5xl"
                    style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                  >
                    Related Articles
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost, index) => (
                    <Reveal key={relatedPost.id} delay={0.8 + (index * 0.1)} width="100%" className="h-full">
                      <Link
                        to={`/blog/${relatedPost.slug}`}
                        onClick={() => {
                          trackEvent('related_article_click', {
                            article_title: relatedPost.title,
                            article_slug: relatedPost.slug
                          });
                        }}
                        className="flex flex-col h-full bg-white cursor-pointer group hover:shadow-md transition-shadow duration-300"
                      >
                        {/* Image */}
                        <div className="relative overflow-hidden bg-gray-200 aspect-[4/3]">
                          {relatedPost.featured_image && (
                            <OptimizedImage
                              src={relatedPost.featured_image}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          )}
                          <div className="absolute top-4 left-4 bg-white px-4 py-2">
                            <span
                              className="text-[#8E8567] text-xs font-bold uppercase tracking-widest"
                              style={{ fontFamily: "'Figtree', sans-serif" }}
                            >
                              {relatedPost.category || "Insight"}
                            </span>
                          </div>
                        </div>

                        <div className="p-8 flex flex-col flex-grow border border-gray-100 border-t-0">
                          {/* Date */}
                          <div className="mb-4 text-gray-400 text-xs uppercase tracking-wider font-medium">
                            {relatedPost.published_at
                              ? new Date(relatedPost.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                              : new Date(relatedPost.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
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
                            {relatedPost.title}
                          </h3>

                          {/* Excerpt */}
                          {relatedPost.excerpt && (
                            <p
                              className="text-gray-500 line-clamp-3 font-light mb-6"
                              style={{
                                fontFamily: "'Figtree', sans-serif",
                                fontSize: "0.9375rem",
                                lineHeight: "1.6"
                              }}
                            >
                              {relatedPost.excerpt}
                            </p>
                          )}

                          <div className="mt-auto pt-6 border-t border-gray-100 flex items-center text-[#1A2551] font-medium text-sm group-hover:translate-x-2 transition-transform duration-300">
                            Read Article <ArrowRight className="w-4 h-4 ml-2" />
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        )}

      </main>
    </>
  );
}