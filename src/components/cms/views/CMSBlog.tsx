import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, FileText, Eye, Calendar, Tag, Search, Code } from 'lucide-react';
import { toast } from 'sonner';
import { CMSPageLayout } from '../CMSPageLayout';
import { BlogEditor } from '../BlogEditor';
import { JSONImportModal } from '../JSONImportModal';
import { BulkImageUploadModal } from '../BulkImageUploadModal';
import type { BlogPost } from '../../../types/database';
import { getAllBlogPostsAdmin, getAllBlogPostsAdminLight, createBlogPost, deleteBlogPost, updateBlogPost, getBlogPostBySlug } from '../../../utils/database';
import { generateBlogSEO } from '../../../utils/autoSEO';
import { Checkbox } from '../../ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { useAuth } from '../../../contexts/AuthContext';

export function CMSBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showJSONImport, setShowJSONImport] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Selection & Deletion State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    id?: number;
  }>({ isOpen: false, type: 'single' });

  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    tldr: '',
    category: 'Insights',
    status: 'draft',
    featured_image: '',
    meta_title: '',
    meta_description: ''
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      // Use lightweight query for list view - much faster!
      const data = await getAllBlogPostsAdminLight();
      setPosts(data as BlogPost[]);
      console.log('📚 Loaded blog posts:', (data as BlogPost[]).length);
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to load blog posts', error);
      toast.error('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  // Selection Handlers
  const handleSelectAll = (checked: boolean, targetPosts: BlogPost[]) => {
    if (checked) {
      const newIds = targetPosts.map(p => p.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...newIds])));
    } else {
      const idsToRemove = new Set(targetPosts.map(p => p.id));
      setSelectedIds(prev => prev.filter(id => !idsToRemove.has(id)));
    }
  };

  const handleSelect = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleEdit = async (post: BlogPost) => {
    try {
      // Fetch full post data including content field
      // The list view uses lightweight queries that exclude content for performance
      const fullPost = await getBlogPostBySlug(post.slug);

      if (!fullPost) {
        toast.error('Failed to load article');
        return;
      }

      console.log('📝 Loading article for editing:', {
        id: fullPost.id,
        title: fullPost.title,
        hasContent: !!fullPost.content,
        contentLength: fullPost.content?.length || 0
      });

      setEditingPost(fullPost);
      setFormData({
        title: fullPost.title,
        slug: fullPost.slug,
        content: fullPost.content || '',
        excerpt: fullPost.excerpt || '',
        tldr: fullPost.tldr || '',
        category: fullPost.category || 'Insights',
        status: fullPost.status,
        published_at: fullPost.published_at,
        featured_image: fullPost.featured_image || '',
        meta_title: fullPost.meta_title || '',
        meta_description: fullPost.meta_description || ''
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error loading article:', error);
      toast.error('Failed to load article');
    }
  };

  const handleAdd = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      tldr: '',
      category: 'Insights',
      status: 'draft',
      featured_image: '',
      meta_title: '',
      meta_description: ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.title) {
        toast.error('Title is required');
        return;
      }

      // Auto-generate slug if empty
      const finalSlug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const postData = {
        ...formData,
        slug: finalSlug
      };

      if (editingPost) {
        const success = await updateBlogPost(editingPost.id, postData);
        if (success) {
          toast.success('Blog post updated successfully');
        } else {
          throw new Error('Update failed');
        }
      } else {
        const result = await createBlogPost({
          ...postData,
          view_count: 0,
          published_at: postData.status === 'published' ? new Date().toISOString() : null
        });

        if (result) {
          toast.success('Blog post created successfully');
        } else {
          throw new Error('Creation failed');
        }
      }

      setShowModal(false);
      loadPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save blog post');
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteConfirm.type === 'single' && deleteConfirm.id) {
        await deleteBlogPost(deleteConfirm.id);
        toast.success('Blog post deleted');
      } else if (deleteConfirm.type === 'bulk') {
        let deletedCount = 0;
        for (const id of selectedIds) {
          try {
            await deleteBlogPost(id);
            deletedCount++;
          } catch (e) {
            console.error(`Failed to delete post ${id}`, e);
          }
        }
        toast.success(`${deletedCount} blog posts deleted`);
      }

      await loadPosts();
      setDeleteConfirm({ isOpen: false, type: 'single' });
    } catch (error) {
      console.error('Failed to delete', error);
      toast.error('Failed to delete blog post');
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirm({ isOpen: true, type: 'single', id });
  };

  const handleBulkDeleteClick = () => {
    setDeleteConfirm({ isOpen: true, type: 'bulk' });
  };


  const handleJSONImport = async (data: any[]) => {
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Valid category options
    const validCategories = [
      'Market Updates', 'Property News', 'Property Insights',
      'Area Guides', 'Buying Advice', 'Selling Advice', 'News'
    ];

    // Valid author options
    const validAuthors = [
      'Darren Bartlett', 'Luke De Quervain', 'Bartlett & Partners'
    ];

    for (const item of data) {
      try {
        // Validate required fields
        if (!item.title?.trim()) {
          console.warn(`⚠️ Skipping item with missing title:`, item);
          errors++;
          continue;
        }

        // Generate slug if not present
        const slug = item.slug || item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `post-${Date.now()}`;

        // Check if blog with this slug already exists
        const existing = posts.find(p => p.slug === slug);
        if (existing) {
          console.log(`Skipping existing post: ${item.title}`);
          skipped++;
          continue;
        }

        // Calculate read time if not provided (approx 200 words per minute)
        let readTime = item.read_time;
        if (!readTime && item.content) {
          const wordCount = item.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
          readTime = Math.max(1, Math.ceil(wordCount / 200));
        }

        // Validate and default category
        let category = item.category || 'Market Updates';
        if (!validCategories.includes(category)) {
          console.warn(`⚠️ Invalid category "${category}" for "${item.title}", defaulting to "Market Updates"`);
          category = 'Market Updates';
        }

        // Validate and default author
        let author = item.author || 'Darren Bartlett';
        if (!validAuthors.includes(author)) {
          console.warn(`⚠️ Invalid author "${author}" for "${item.title}", defaulting to "Darren Bartlett"`);
          author = 'Darren Bartlett';
        }

        // Build comprehensive blog post data (ALL fields except images)
        const blogPostData: Partial<BlogPost> = {
          // === CORE ARTICLE FIELDS ===
          title: item.title.trim(),
          slug: slug,
          excerpt: item.excerpt?.trim() || null,
          tldr: item.tldr?.trim() || null,
          content: item.content || '',

          // === PUBLISHING FIELDS ===
          author: author,
          category: category,
          read_time: readTime || 5,
          status: item.status || 'draft', // Default to draft for safety
          published_at: item.published_at || (item.status === 'published' ? new Date().toISOString() : null),
          view_count: item.view_count || 0,

          // === SEO FIELDS ===
          meta_title: item.meta_title || null,
          meta_description: item.meta_description || null,
          keywords: item.keywords || null,
          noindex: item.noindex ?? false,
          nofollow: item.nofollow ?? false,
          sitemap_enabled: item.sitemap_enabled ?? true,

          // === IMAGES - NOT IMPORTED (must be uploaded directly) ===
          // featured_image, featured_image_alt - NOT IMPORTED
        };

        // Auto-generate SEO if not provided
        if (!blogPostData.meta_title || !blogPostData.meta_description) {
          const autoSEO = generateBlogSEO(blogPostData as BlogPost);
          if (!blogPostData.meta_title) blogPostData.meta_title = autoSEO.title;
          if (!blogPostData.meta_description) blogPostData.meta_description = autoSEO.description;
        }

        // Log what we're about to import for debugging
        console.log(`📝 Importing blog post:`, {
          title: blogPostData.title,
          slug: blogPostData.slug,
          category: blogPostData.category,
          author: blogPostData.author,
          status: blogPostData.status,
          hasExcerpt: !!blogPostData.excerpt,
          hasTldr: !!blogPostData.tldr,
          hasContent: !!blogPostData.content,
          contentLength: blogPostData.content?.length || 0
        });

        const result = await createBlogPost(blogPostData);

        if (result) {
          imported++;
          console.log(`✅ Successfully imported: ${item.title} (ID: ${result.id})`);
        } else {
          errors++;
          console.error(`❌ Failed to import: ${item.title} - createBlogPost returned null`);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error importing ${item.title}:`, error);
      }
    }

    await loadPosts();

    // Show appropriate toast message
    if (errors > 0) {
      toast.error(`Imported ${imported}, failed ${errors}, skipped ${skipped} duplicates`);
    } else if (skipped > 0) {
      toast.info(`Imported ${imported}, skipped ${skipped} duplicates`);
    } else {
      toast.success(`Successfully imported ${imported} blog posts`);
    }
  };

  const { isAdmin } = useAuth();

  const actions = [
    ...(isAdmin ? [
      { label: "Import JSON", icon: Code, onClick: () => setShowJSONImport(true), variant: 'outline' as const },
      { label: "Bulk Images", icon: Tag, onClick: () => setShowBulkUpload(true), variant: 'outline' as const }
    ] : []),
    { label: "New Article", icon: Plus, onClick: handleAdd },
  ];

  if (selectedIds.length > 0) {
    actions.unshift({
      label: `Delete Selected (${selectedIds.length})`,
      icon: Trash2,
      onClick: handleBulkDeleteClick,
      variant: 'outline' as const
    });
  }

  const filteredPosts = posts.filter(post => {
    const term = searchTerm.toLowerCase();
    return (
      post.title?.toLowerCase().includes(term) ||
      post.category?.toLowerCase().includes(term) ||
      post.status?.toLowerCase().includes(term) ||
      post.slug?.toLowerCase().includes(term)
    );
  });

  const drafts = filteredPosts.filter(p => p.status !== 'published');
  const published = filteredPosts.filter(p => p.status === 'published');

  const renderTable = (tablePosts: BlogPost[], title: string) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8 last:mb-0">
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          {title}
          <span className="bg-gray-200 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-normal">
            {tablePosts.length}
          </span>
        </h3>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="w-10 px-6 py-3">
              <Checkbox
                checked={tablePosts.length > 0 && tablePosts.every(p => selectedIds.includes(p.id))}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean, tablePosts)}
              />
            </th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider w-[35%]">Article</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider w-[15%]">Category</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider w-[12%]">Status</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider w-[15%]">Published</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider w-[13%]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tablePosts.map((post) => (
            <tr key={post.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <Checkbox
                  checked={selectedIds.includes(post.id)}
                  onCheckedChange={(checked) => handleSelect(post.id, checked as boolean)}
                />
              </td>
              <td className="px-6 py-4 w-[35%]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={(post as any).featured_image_alt || post.title || 'Blog post featured image'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 line-clamp-1">{post.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">/{post.slug}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 w-[15%]">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
                  {post.category || 'Uncategorized'}
                </span>
              </td>
              <td className="px-6 py-4 w-[12%]">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${post.status === 'published'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {post.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 w-[15%]">
                {post.published_at ? new Date(post.published_at).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 w-[13%]">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                    title="Edit Article"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(post.id)}
                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete Article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <CMSPageLayout
      title="Insights"
      description="Manage articles, news, and market insights"
      actions={actions}
    >
      <BulkImageUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onUploadComplete={loadPosts}
        posts={filteredPosts}
      />

      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm.type === 'bulk'
                ? `This will permanently delete ${selectedIds.length} selected articles. This action cannot be undone.`
                : "This action cannot be undone. This will permanently delete the article."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-700 hover:bg-red-800">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <JSONImportModal
        isOpen={showJSONImport}
        onClose={() => setShowJSONImport(false)}
        onImport={handleJSONImport}
        type="blog"
      />

      {/* Filters / Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent text-sm"
          />
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3 pl-1">
        <div className="h-6 w-1 bg-[#1A2551] rounded-full"></div>
        <h2 className="text-xl font-semibold text-[#1A2551] select-none">All Articles</h2>
        <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-200">
          {posts.length} Total
        </span>
        <div className="flex items-center gap-2 ml-2">
          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-emerald-200">
            {posts.filter(p => p.status === 'published').length} Published
          </span>
          <span className="bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-yellow-200">
            {posts.filter(p => p.status !== 'published').length} Drafts
          </span>
        </div>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Loading posts...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          {searchTerm ? 'No articles found matching your search.' : 'No blog posts found. Create your first article to get started.'}
        </div>
      ) : (
        <div className="space-y-8">
          {drafts.length > 0 && renderTable(drafts, 'Drafts')}
          {published.length > 0 && renderTable(published, 'Published Articles')}
          {/* Fallback for anything else (should be empty but keeping robust) */}
          {filteredPosts.length > (drafts.length + published.length) && renderTable(filteredPosts.filter(p => p.status !== 'published' && p.status !== 'draft'), 'Other')}
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <BlogEditor
          post={editingPost}
          onClose={() => setShowModal(false)}
          onSave={loadPosts}
        />
      )}
    </CMSPageLayout>
  );
}