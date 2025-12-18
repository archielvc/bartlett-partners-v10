import { useState, useEffect, useRef } from 'react';
import {
  X, Save, Trash2, FileText, Calendar, Image as ImageIcon, Search as SearchIcon,
  AlertCircle, Eye, User, Sparkles, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CMSImageUpload } from './CMSImageUpload';
import { CharacterCounter } from './CharacterCounter';
import type { BlogPost } from '../../types/database';
import { updateBlogPost, createBlogPost, deleteBlogPost, getStaticPageByName } from '../../utils/database';
import { generateBlogSEO } from '../../utils/autoSEO';
import { generateSEOFromContent, generateSEOWithAI } from '../../utils/aiSEO';

interface BlogEditorProps {
  post?: BlogPost | null;
  onClose: () => void;
  onSave: () => void;
}

type Section = 'article' | 'publishing' | 'media-seo';

export function BlogEditor({ post, onClose, onSave }: BlogEditorProps) {
  const [activeSection, setActiveSection] = useState<Section>('article');

  // Initialize formData directly from post to avoid flash of empty values
  const [formData, setFormData] = useState<Partial<BlogPost>>(() => {
    if (post) {
      return {
        title: post.title || '',
        slug: post.slug || '',
        author: post.author || 'Darren Bartlett',
        category: post.category || 'Market Updates',
        status: post.status || 'draft',
        excerpt: post.excerpt || '',
        content: post.content || '',
        featured_image: post.featured_image || null,
        featured_image_alt: post.featured_image_alt || null,
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        keywords: (post as any).keywords || '',
        noindex: post.noindex || false,
        nofollow: post.nofollow || false,
        sitemap_enabled: post.sitemap_enabled !== undefined ? post.sitemap_enabled : true,
        published_at: post.published_at || null,
        read_time: post.read_time || 5
      };
    }
    return {
      title: '',
      slug: '',
      author: 'Darren Bartlett',
      category: 'Market Updates',
      status: 'draft',
      excerpt: '',
      content: '',
      featured_image: null,
      featured_image_alt: null,
      meta_title: '',
      meta_description: '',
      keywords: '',
      noindex: false,
      nofollow: false,
      sitemap_enabled: true,
      published_at: null,
      read_time: 5
    };
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [parentSlug, setParentSlug] = useState('insights');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Fetch parent page slug (Insights)
  useEffect(() => {
    getStaticPageByName('Insights').then(page => {
      if (page?.slug) setParentSlug(page.slug.replace(/^\//, ''));
    });
  }, []);

  // Load post data if editing
  useEffect(() => {
    if (post) {
      // Debug: log incoming post when opening editor
      console.log('🧩 BlogEditor received post:', {
        id: post.id,
        title: post.title,
        slug: post.slug,
        hasExcerpt: !!post.excerpt,
        excerptPreview: post.excerpt?.substring(0, 60) || '[empty]',
        hasContent: !!post.content,
        contentLength: post.content?.length || 0,
        category: post.category,
        status: post.status,
        author: post.author,
        published_at: post.published_at
      });

      // ⚠️ CRITICAL SAFETY CHECK: Detect missing content on existing posts
      if (post.id && !post.content) {
        console.error('❌ CRITICAL: Editing existing post but content field is missing!');
        console.error('This indicates the post was loaded with a lightweight query.');
        console.error('Saving now would cause data loss. Post ID:', post.id);
        toast.error('Warning: Article content not loaded properly. Please close and try again.', {
          duration: 10000
        });
      }

      setFormData({
        title: post.title,
        slug: post.slug,
        author: post.author || 'Darren Bartlett',
        category: post.category || 'Market Updates',
        status: post.status,
        excerpt: post.excerpt || '',
        content: post.content || '',
        featured_image: post.featured_image || null,
        featured_image_alt: post.featured_image_alt || null,
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        keywords: (post as any).keywords || '',
        noindex: post.noindex || false,
        nofollow: post.nofollow || false,
        sitemap_enabled: post.sitemap_enabled !== undefined ? post.sitemap_enabled : true,
        published_at: post.published_at,
        read_time: post.read_time || 5
      });

      // Debug: log initial form data after mapping
      console.log('🧩 BlogEditor initial formData:', {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '[empty]',
        category: post.category,
        status: post.status
      });
    }
  }, [post]);

  // Debug: track formData changes over time
  useEffect(() => {
    console.log('🧩 BlogEditor formData state changed:', {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      category: formData.category,
      status: formData.status
    });
  }, [formData]);

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(post || {});
    setHasUnsavedChanges(hasChanges);
  }, [formData, post]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !post) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, post]);

  // Auto-generate meta title and description if empty
  useEffect(() => {
    if (formData.title && !formData.meta_title) {
      setFormData(prev => ({
        ...prev,
        meta_title: `${formData.title} - Bartlett & Partners`.substring(0, 60)
      }));
    }
    if (formData.excerpt && !formData.meta_description) {
      setFormData(prev => ({
        ...prev,
        meta_description: (formData.excerpt || '').substring(0, 155)
      }));
    }
  }, [formData.title, formData.excerpt]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (hasUnsavedChanges && post) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, formData]);

  // Warn on navigation if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // Keep beforeunload for when user navigates away from entire page
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleAutoSave = async () => {
    if (!post) return;

    try {
      await updateBlogPost(post.id, formData);
      toast.success('Auto-saved', { duration: 1500 });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.title?.trim()) errors.push('Title is required');
    if (!formData.content?.trim()) errors.push('Content is required');
    if (!formData.slug?.trim()) errors.push('Slug is required');
    if (!formData.excerpt?.trim()) errors.push('Excerpt is required');

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async (isDraft: boolean = false) => {
    if (!isDraft && !validateForm()) {
      toast.error('Please fill in all required fields');
      if (!formData.title || !formData.content || !formData.excerpt) {
        setActiveSection('article');
      } else if (!formData.slug) {
        setActiveSection('media-seo');
      }
      return;
    }

    setIsSaving(true);
    try {
      // Calculate read time from content word count
      const wordCount = formData.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
      const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

      // Determine status
      const finalStatus = isDraft ? 'draft' : (formData.status || 'published');
      const publishedAt = finalStatus === 'draft' ? null : (formData.published_at || new Date().toISOString());

      // Auto-generate SEO if empty
      const autoMetaTitle = formData.meta_title || `${formData.title} - Bartlett & Partners`.substring(0, 60);
      const autoMetaDesc = formData.meta_description || formData.excerpt?.substring(0, 155) || '';

      // Auto-generate keywords if empty
      let finalKeywords = formData.keywords || '';
      if (!finalKeywords && formData.title) {
        const autoSEO = generateBlogSEO({
          title: formData.title || '',
          category: formData.category || 'Insights',
          content: formData.content || '',
          keywords: ''
        } as BlogPost);
        finalKeywords = autoSEO.keywords.join(', ');
      }

      // Ensure featured image alt text is always set when a featured image exists
      const featuredImageAlt =
        formData.featured_image
          ? (formData.featured_image_alt?.toString().trim() || formData.title?.toString().trim() || 'Bartlett & Partners featured image')
          : null;

      const postData = {
        title: formData.title || '',
        slug: formData.slug || '',
        excerpt: formData.excerpt || null,
        content: formData.content || '',
        author: formData.author || 'Darren Bartlett',
        category: formData.category || 'Market Updates',
        featured_image: formData.featured_image || null,
        featured_image_alt: featuredImageAlt,
        read_time: calculatedReadTime,
        meta_title: autoMetaTitle,
        meta_description: autoMetaDesc,
        keywords: finalKeywords,
        noindex: formData.noindex || false,
        nofollow: formData.nofollow || false,
        sitemap_enabled: formData.sitemap_enabled !== false,
        status: finalStatus,
        published_at: publishedAt,
        view_count: 0
      };

      if (post) {
        const success = await updateBlogPost(post.id, postData);
        if (success) {
          toast.success(isDraft ? 'Draft saved successfully' : 'Article saved successfully');
        } else {
          throw new Error('Update failed');
        }
      } else {
        const result = await createBlogPost(postData);
        if (result) {
          toast.success(isDraft ? 'Draft created successfully' : 'Article published successfully');
        } else {
          throw new Error('Create failed');
        }
      }

      setHasUnsavedChanges(false);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article. Check console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;

    try {
      await deleteBlogPost(post.id);
      toast.success('Article deleted successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  };

  // Generate SEO from article content
  const handleGenerateSEO = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Please add a title and content first');
      return;
    }

    setIsGeneratingSEO(true);
    try {
      // Check for OpenAI API key in localStorage (user can set it in settings)
      const apiKey = localStorage.getItem('openai_api_key');

      const seo = apiKey
        ? await generateSEOWithAI(
          formData.title,
          formData.content,
          formData.category,
          apiKey
        )
        : generateSEOFromContent(
          formData.title,
          formData.content,
          formData.category,
          formData.slug
        );

      // Update form with generated SEO
      setFormData(prev => ({
        ...prev,
        meta_title: seo.metaTitle,
        meta_description: seo.metaDescription,
        keywords: seo.keywords,
        slug: seo.slug || prev.slug
      }));

      // Set alt text separately
      if (seo.altText) {
        setFormData(prev => ({
          ...prev,
          featured_image_alt: seo.altText
        }));
      }

      toast.success(apiKey ? 'SEO generated with AI!' : 'SEO generated from content analysis');
    } catch (error) {
      console.error('Error generating SEO:', error);
      toast.error('Failed to generate SEO');
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  // Google Search Preview Component
  const GooglePreview = () => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="text-xs text-gray-600 mb-1">
        bartlettpartners.co.uk › blog › {formData.slug || 'article-slug'}
      </div>
      <div className="text-blue-600 text-lg mb-1 line-clamp-1">
        {formData.meta_title || formData.title || 'Article Title'}
      </div>
      <div className="text-sm text-gray-600 line-clamp-2">
        {formData.meta_description || formData.excerpt || 'Article description will appear here...'}
      </div>
    </div>
  );

  const sections = [
    { id: 'article' as Section, label: 'Edit Article', icon: FileText },
    { id: 'publishing' as Section, label: 'Publishing', icon: Calendar },
    { id: 'media-seo' as Section, label: 'SEO', icon: SearchIcon },
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {post ? 'Edit Article' : 'New Article'}
            </h1>
            {hasUnsavedChanges && (
              <p className="text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Unsaved changes
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${isActive
                    ? 'bg-[#1A2551] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2 text-red-800 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Required fields:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    {validationErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Edit Article Section */}
            {activeSection === 'article' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Edit Article</h2>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter article title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent text-lg"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={formData.excerpt || ''}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value.substring(0, 200) })}
                      placeholder="Short summary shown on blog cards and in search results (max 200 characters)..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent resize-none"
                      maxLength={200}
                    />
                    <div className="absolute right-3 bottom-3">
                      <CharacterCounter
                        current={formData.excerpt?.length || 0}
                        optimal={160}
                        max={200}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This will appear on blog listing pages and as the preview text
                  </p>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <div className="rich-text-editor border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={formData.content || ''}
                      onChange={(value) => setFormData({ ...formData, content: value })}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline'],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                          ['blockquote'],
                          ['link'],
                          ['clean']
                        ],
                      }}
                      formats={[
                        'header',
                        'bold', 'italic', 'underline',
                        'list', 'bullet',
                        'blockquote',
                        'link'
                      ]}
                      placeholder="Write your article content here..."
                      className="bg-white"
                      style={{ minHeight: '500px' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Publishing Section */}
            {activeSection === 'publishing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Publishing</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  {/* Author */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                    >
                      <option value="Darren Bartlett">Darren Bartlett</option>
                      <option value="Luke De Quervain">Luke De Quervain</option>
                      <option value="Bartlett & Partners">Bartlett & Partners</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                    >
                      <option value="Market Updates">Market Updates</option>
                      <option value="Property News">Property News</option>
                      <option value="Property Insights">Property Insights</option>
                      <option value="Area Guides">Area Guides</option>
                      <option value="Buying Advice">Buying Advice</option>
                      <option value="Selling Advice">Selling Advice</option>
                      <option value="News">News</option>
                    </select>
                  </div>

                  {/* Published Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Published Date
                    </label>
                    <input
                      type="date"
                      value={formData.published_at ? new Date(formData.published_at).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        published_at: e.target.value ? new Date(e.target.value).toISOString() : null
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-set when published if left empty</p>
                  </div>
                </div>
              </div>
            )}

            {/* Featured Image & SEO Section */}
            {activeSection === 'media-seo' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured Image & SEO</h2>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image <span className="text-red-500">*</span>
                  </label>
                  <CMSImageUpload
                    value={formData.featured_image || ''}
                    onChange={(url) => setFormData({ ...formData, featured_image: url })}
                    variant="stack"
                    initialAlt={formData.featured_image_alt || ''}
                    onAltChange={(alt) => setFormData(prev => ({ ...prev, featured_image_alt: alt }))}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Banner image shown at top of article and on blog cards. Click "Generate SEO" to auto-create alt text.
                  </p>
                </div>

                {/* SEO Fields */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <SearchIcon className="w-5 h-5 text-[#8E8567]" />
                      Search Engine Optimisation
                    </h3>
                    <button
                      type="button"
                      onClick={handleGenerateSEO}
                      disabled={isGeneratingSEO || !formData.title || !formData.content}
                      title={!formData.title || !formData.content ? 'Add title and content first' : 'Generate SEO metadata from content'}
                      className="flex-shrink-0 px-4 py-2.5 bg-[#1A2551] text-white rounded-lg hover:bg-[#1A2551]/90 transition-all font-medium text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl border border-[#1A2551] whitespace-nowrap"
                    >
                      {isGeneratingSEO ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate SEO
                        </>
                      )}
                    </button>
                  </div>

                  {(!formData.title || !formData.content) && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        Add a title and content in the Edit Article tab to enable SEO generation.
                      </p>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* URL Slug */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Slug <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.slug || ''}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="article-url-slug"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL: /{parentSlug}/{formData.slug || 'article-slug'}
                      </p>
                    </div>

                    {/* Meta Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Title
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.meta_title || ''}
                          onChange={(e) => setFormData({ ...formData, meta_title: e.target.value.substring(0, 60) })}
                          placeholder="Auto-generated from title"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent pr-16"
                          maxLength={60}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CharacterCounter
                            current={formData.meta_title?.length || 0}
                            optimal={50}
                            max={60}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                      </label>
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={formData.meta_description || ''}
                          onChange={(e) => setFormData({ ...formData, meta_description: e.target.value.substring(0, 155) })}
                          placeholder="Auto-generated from excerpt"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent resize-none"
                          maxLength={155}
                        />
                        <div className="absolute right-3 bottom-3">
                          <CharacterCounter
                            current={formData.meta_description?.length || 0}
                            optimal={145}
                            max={155}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Focus Keywords
                      </label>
                      <input
                        type="text"
                        value={formData.keywords || ''}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        placeholder="Auto-generated if empty (comma-separated)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to auto-generate from title and category
                      </p>
                    </div>

                    {/* Canonical URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Canonical URL
                      </label>
                      <input
                        type="text"
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${parentSlug}/${formData.slug || 'article-slug'}`}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    {/* Search Engine Settings */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Search Engine Settings</h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!formData.noindex}
                            onChange={(e) => setFormData({ ...formData, noindex: !e.target.checked })}
                            className="w-4 h-4 text-[#1A2551] rounded border-gray-300 focus:ring-[#1A2551]"
                          />
                          <span className="text-sm text-gray-700">Allow search engines to index this page</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!formData.nofollow}
                            onChange={(e) => setFormData({ ...formData, nofollow: !e.target.checked })}
                            className="w-4 h-4 text-[#1A2551] rounded border-gray-300 focus:ring-[#1A2551]"
                          />
                          <span className="text-sm text-gray-700">Allow search engines to follow links</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.sitemap_enabled !== false}
                            onChange={(e) => setFormData({ ...formData, sitemap_enabled: e.target.checked })}
                            className="w-4 h-4 text-[#1A2551] rounded border-gray-300 focus:ring-[#1A2551]"
                          />
                          <span className="text-sm text-gray-700">Include in XML sitemap</span>
                        </label>
                      </div>
                    </div>

                    {/* Google Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Search Preview
                      </label>
                      <GooglePreview />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
        <div>
          {post && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Article
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="px-6 py-2.5 border border-gray-300 bg-white rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#1A2551] text-white rounded-lg hover:bg-[#1A2551]/90 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Unsaved Changes</h3>
            </div>
            <p className="text-gray-600 mb-6">
              You have unsaved changes that will be lost if you leave this page. Would you like to save your work first?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowUnsavedModal(false);
                  onClose();
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Discard Changes
              </button>
              <button
                onClick={() => setShowUnsavedModal(false)}
                className="px-4 py-2 bg-[#1A2551] text-white rounded-lg hover:bg-[#1A2551]/90 transition-colors font-medium"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
