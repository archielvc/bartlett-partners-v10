import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Upload, User, Quote, Eye, EyeOff, X, GripVertical } from 'lucide-react';
import type { Testimonial as DBTestimonial } from '../../types/database';
import { toast } from 'sonner';
import { CSVImportModal } from './CSVImportModal';
import { CMSPageLayout } from './CMSPageLayout';
import { Button } from '../ui/button';
import { getAllTestimonialsAdmin, createTestimonial, updateTestimonial, deleteTestimonial, reorderTestimonials } from '../../utils/database';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
function SortableTestimonialCard({ 
  testimonial, 
  onEdit, 
  onDelete, 
  onTogglePublished 
}: { 
  testimonial: DBTestimonial;
  onEdit: (t: DBTestimonial) => void;
  onDelete: (id: number) => void;
  onTogglePublished: (t: DBTestimonial) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: testimonial.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-white rounded-xl border border-gray-200/80 p-6 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 relative overflow-hidden"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>

      {/* Quote Icon Background */}
      <Quote className="absolute top-4 right-4 w-8 h-8 text-gray-100 group-hover:text-[#C5A059]/10 transition-colors rotate-180" />

      <div className="flex items-start gap-4 mb-6 relative z-10 ml-8">
        <div className="w-12 h-12 bg-[#1A2551]/5 rounded-full flex items-center justify-center flex-shrink-0 text-[#1A2551]">
          <User className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1A2551] truncate">{testimonial.author}</h3>
          <p className="text-sm text-gray-500 truncate">{testimonial.role || 'Client'}</p>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-3 h-3 fill-[#C5A059] text-[#C5A059]" />
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-6 min-h-[80px] ml-8">
        <p className="text-gray-600 leading-relaxed text-sm line-clamp-4 italic">&ldquo;{testimonial.content}&rdquo;</p>
      </div>
      
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 ml-8">
        <button
          onClick={() => onEdit(testimonial)}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors font-medium flex items-center justify-center gap-2 group/btn"
        >
          <Edit className="w-3.5 h-3.5 group-hover/btn:text-[#1A2551]" />
          Edit
        </button>
        
        <button
          onClick={() => onTogglePublished(testimonial)}
          className={`px-3 py-2 text-sm border border-gray-200 rounded-lg transition-colors ${
            testimonial.published 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
          }`}
          title={testimonial.published ? "Published" : "Hidden"}
        >
          {testimonial.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <button 
          onClick={() => onDelete(testimonial.id as number)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-100 hover:text-red-600 text-gray-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function TestimonialsModule() {
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<DBTestimonial | null>(null);
  const [formData, setFormData] = useState({
    author: '',
    role: '',
    content: '',
    published: true,
  });

  const [testimonials, setTestimonials] = useState<DBTestimonial[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch testimonials from database
  const fetchTestimonials = async () => {
    const data = await getAllTestimonialsAdmin();
    // Sort by display_order
    const sorted = [...data].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    setTestimonials(sorted);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = testimonials.findIndex((t) => t.id.toString() === active.id);
      const newIndex = testimonials.findIndex((t) => t.id.toString() === over.id);

      const reordered = arrayMove(testimonials, oldIndex, newIndex);
      setTestimonials(reordered);
      
      // Save to database
      await reorderTestimonials(reordered);
      toast.success('Testimonials reordered!');
    }
  };

  const handleEdit = (testimonial: DBTestimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      author: testimonial.author,
      role: testimonial.role || '',
      content: testimonial.content,
      published: testimonial.published,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingTestimonial(null);
    setFormData({
      author: '',
      role: '',
      content: '',
      published: true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingTestimonial) {
        // Update existing testimonial
        await updateTestimonial(editingTestimonial.id as number, formData);
        setTestimonials(testimonials.map(t => 
          t.id === editingTestimonial.id 
            ? { ...t, ...formData }
            : t
        ));
        toast.success('Testimonial updated successfully!');
      } else {
        // Add new testimonial
        const newTestimonial = await createTestimonial({
          ...formData,
          rating: 5,
          display_order: testimonials.length,
        });
        if (newTestimonial) {
          setTestimonials([...testimonials, newTestimonial]);
          toast.success('Testimonial created successfully!');
        }
      }
      handleClose();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Failed to save testimonial');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      await deleteTestimonial(id);
      setTestimonials(testimonials.filter(t => t.id !== id));
      toast.success('Testimonial deleted successfully!');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const togglePublished = async (testimonial: DBTestimonial) => {
    try {
      const newPublishedStatus = !testimonial.published;
      await updateTestimonial(testimonial.id as number, { published: newPublishedStatus });
      setTestimonials(testimonials.map(t =>
        t.id === testimonial.id
          ? { ...t, published: newPublishedStatus }
          : t
      ));
      toast.success(newPublishedStatus ? 'Testimonial published!' : 'Testimonial unpublished');
    } catch (error) {
      console.error('Error toggling published status:', error);
      toast.error('Failed to update testimonial');
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingTestimonial(null);
    setFormData({ author: '', role: '', content: '', published: true });
  };

  const handleBatchImport = async (data: any[]) => {
    for (const item of data) {
      try {
        await createTestimonial({
          ...item,
          published: item.published !== false, // Default to true
          display_order: 99 // Append to end
        });
      } catch (e) {
        console.error("Failed to import item", item, e);
      }
    }
    await fetchTestimonials();
  };

  return (
    <CMSPageLayout 
      title="Testimonials" 
      description="Manage client testimonials and reviews. Drag to reorder."
      actions={[
        { label: "Import CSV", icon: Upload, onClick: () => setShowImport(true), variant: 'outline' },
        { label: "Add Testimonial", icon: Plus, onClick: handleAdd },
      ]}
    >
      <CSVImportModal 
        isOpen={showImport} 
        onClose={() => setShowImport(false)} 
        onImport={handleBatchImport} 
        type="testimonials" 
      />

      {/* Card List with Drag and Drop */}
      {testimonials.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <Quote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No testimonials yet.</p>
          <p className="text-sm text-gray-400 mb-6">Create your own testimonials.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Hover over a testimonial card and drag the grip handle on the left to reorder. The order here determines how testimonials appear on your website.
            </p>
          </div>

          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={testimonials.map(t => t.id.toString())}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <SortableTestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePublished={togglePublished}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#1A2551]">
                {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Client Name</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. James Smith"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551] focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role / Location</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Vendor, Richmond"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Testimonial</label>
                <textarea
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the client's testimonial..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551] focus:bg-white transition-colors resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#1A2551] text-white hover:bg-[#1A2551]/90"
              >
                {editingTestimonial ? 'Save Changes' : 'Add Testimonial'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </CMSPageLayout>
  );
}