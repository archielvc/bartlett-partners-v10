import { useState, useEffect } from 'react';
import { Mail, Phone, Home, FileText, Filter, Download, Users, MessageSquare, Trash2, MapPin, Banknote, BedDouble, Calendar, Star } from 'lucide-react';
import { toast } from 'sonner';
import { CMSPageLayout } from '../CMSPageLayout';
import { Button } from '../../ui/button';
import { getContactSubmissions, updateContactSubmissionStatus, deleteContactSubmission } from '../../../utils/database';
import { enquiryEvents } from '../../../utils/enquiryEvents';
import type { ContactSubmission, ContactSubmissionWithProperty } from '../../../types/database';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

type FilterStatus = 'all' | 'new' | 'in_progress' | 'closed';
type TabType = 'enquiries' | 'newsletter';

export function CMSEnquiries() {
  const [enquiries, setEnquiries] = useState<ContactSubmissionWithProperty[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const [activeTab, setActiveTab] = useState<TabType>('enquiries');
  const [loading, setLoading] = useState(true);
  const [enquiryToDelete, setEnquiryToDelete] = useState<ContactSubmissionWithProperty | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getContactSubmissions();
      setEnquiries(data);
    } catch (error) {
      console.error("Failed to load enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: number, newStatus: ContactSubmission['status']) => {
    // Find the enquiry to get its previous status
    const enquiry = enquiries.find(e => e.id === id);
    const previousStatus = enquiry?.status;

    await updateContactSubmissionStatus(id, newStatus);
    // Optimistic update
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));

    // Emit event for sidebar badge to update
    enquiryEvents.emit({
      type: 'status-changed',
      enquiryId: id,
      previousStatus,
      newStatus
    });
  };

  const handleDeleteClick = (enquiry: ContactSubmissionWithProperty) => {
    setEnquiryToDelete(enquiry);
  };

  const confirmDelete = async () => {
    if (!enquiryToDelete) return;

    const previousStatus = enquiryToDelete.status;

    try {
      const success = await deleteContactSubmission(enquiryToDelete.id);
      if (success) {
        setEnquiries(prev => prev.filter(e => e.id !== enquiryToDelete.id));
        toast.success('Inquiry deleted successfully');

        // Emit event for sidebar badge to update
        enquiryEvents.emit({
          type: 'deleted',
          enquiryId: enquiryToDelete.id,
          previousStatus
        });
      } else {
        toast.error('Failed to delete inquiry');
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('An error occurred while deleting the inquiry');
    } finally {
      setEnquiryToDelete(null);
    }
  };

  const handleExportNewNewsletters = () => {
    const newsletters = enquiries.filter(e => e.inquiry_type === 'newsletter' && e.status === 'new');

    if (newsletters.length === 0) {
      toast.error('No new newsletter sign-ups to export');
      return;
    }

    // Create CSV content with new fields
    const headers = ['Name', 'Email', 'Phone', 'Address', 'Price Range', 'Min Beds', 'Timeline', 'Date', 'Time'];
    const rows = newsletters.map(n => [
      n.name,
      n.email,
      n.phone || '',
      n.address || '',
      n.price_range || '',
      n.min_beds || '',
      n.timeline || '',
      new Date(n.created_at).toLocaleDateString('en-GB'),
      new Date(n.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter-signups-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${newsletters.length} newsletter sign-up(s)`);
  };

  // Separate enquiries and newsletters
  const realEnquiries = enquiries.filter(e => e.inquiry_type !== 'newsletter');
  const newsletters = enquiries.filter(e => e.inquiry_type === 'newsletter');

  // Apply status filter
  const baseArray = activeTab === 'enquiries' ? realEnquiries : newsletters;
  const filteredEnquiries = baseArray.filter(e => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'closed') {
        if (e.status !== 'closed' && e.status !== 'archived') return false;
      } else if (statusFilter === 'in_progress') {
        if (e.status !== 'in_progress' && e.status !== 'read' && e.status !== 'replied') return false;
      } else {
        if (e.status !== statusFilter) return false;
      }
    }
    return true;
  });

  // Calculate counts for each filter status
  const statusCounts: Record<FilterStatus, number> = {
    all: baseArray.length,
    new: baseArray.filter(e => e.status === 'new').length,
    in_progress: baseArray.filter(e =>
      e.status === 'in_progress' || e.status === 'read' || e.status === 'replied'
    ).length,
    closed: baseArray.filter(e =>
      e.status === 'closed' || e.status === 'archived'
    ).length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20">New</span>;
      case 'in_progress':
      case 'read':
      case 'replied':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1A2551]/10 text-[#1A2551] border border-[#1A2551]/20">In Progress</span>;
      case 'closed':
      case 'archived':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Closed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getTypeBadge = (type?: string, propertyId?: string | null) => {
    const resolvedType = type || (propertyId ? 'property' : 'general');

    switch (resolvedType) {
      case 'property':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"><Home className="w-3 h-3" /> Property</span>;
      case 'valuation':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"><FileText className="w-3 h-3" /> Valuation</span>;
      case 'newsletter':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"><Mail className="w-3 h-3" /> Newsletter</span>;
      case 'general':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"><MessageSquare className="w-3 h-3" /> General</span>;
    }
  };

  // Check if newsletter subscriber has preferences (completed Step 2)
  const hasPriorityAccess = (enquiry: ContactSubmissionWithProperty) => {
    return enquiry.inquiry_type === 'newsletter' &&
           (enquiry.price_range || enquiry.min_beds || enquiry.timeline || enquiry.address);
  };

  const newNewsletterCount = newsletters.filter(n => n.status === 'new').length;

  return (
    <>
      <CMSPageLayout title="Enquiries & Newsletters" description="Manage incoming leads, viewing requests and newsletter sign-ups.">
        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab('enquiries')}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'enquiries'
                ? 'bg-[#1A2551] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <MessageSquare className="w-4 h-4" />
              Enquiries
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'enquiries' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                {realEnquiries.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('newsletter')}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'newsletter'
                ? 'bg-[#1A2551] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Users className="w-4 h-4" />
              Newsletter
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'newsletter' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                {newsletters.length}
              </span>
              {newNewsletterCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
              )}
            </button>
          </div>

          {activeTab === 'newsletter' && newNewsletterCount > 0 && (
            <Button
              onClick={handleExportNewNewsletters}
              variant="outline"
              className="border-[#1A2551]/20 text-[#1A2551] hover:bg-[#1A2551]/5 px-6 font-semibold w-auto"
            >
              <Download className="w-4 h-4" />
              Export New Sign-ups ({newNewsletterCount})
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            {(['all', 'new', 'in_progress', 'closed'] as FilterStatus[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all flex items-center gap-2 ${statusFilter === f
                  ? 'bg-[#1A2551] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {f.replace('_', ' ')}
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${statusFilter === f
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
                  }`}>
                  {statusCounts[f]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>Filter results</span>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-[#1A2551] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading {activeTab === 'newsletter' ? 'newsletter sign-ups' : 'enquiries'}...</p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              {activeTab === 'newsletter' ? <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" /> : <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />}
              <p className="text-gray-500 mb-2">No {activeTab === 'newsletter' ? 'newsletter sign-ups' : 'enquiries'} found matching current filters.</p>
              {(activeTab === 'enquiries' ? realEnquiries.length : newsletters.length) === 0 && (
                <p className="text-sm text-gray-400">Wait for new enquiries to appear here.</p>
              )}
            </div>
          ) : (
            filteredEnquiries.map((enquiry) => (
              <div key={enquiry.id} className={`bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md ${enquiry.status === 'new' ? 'border-l-4 border-l-[#C5A059] border-y-gray-100 border-r-gray-100' : 'border-gray-100'}`}>

                {/* Header Section */}
                <div className="p-5 pb-4 border-b border-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0
                        ${enquiry.status === 'new' ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'bg-gray-100 text-gray-500'}`}>
                        {enquiry.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Name & Meta */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-[#1A2551] text-lg">{enquiry.name}</h3>
                          {getStatusBadge(enquiry.status)}
                          {hasPriorityAccess(enquiry) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <Star className="w-3 h-3" /> Priority
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          {getTypeBadge(enquiry.inquiry_type, enquiry.property_id?.toString())}
                          <span className="text-gray-300">•</span>
                          <span>{new Date(enquiry.created_at).toLocaleDateString('en-GB')} {new Date(enquiry.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        value={
                          ['read', 'replied'].includes(enquiry.status || '') ? 'in_progress' :
                            ['archived'].includes(enquiry.status || '') ? 'closed' :
                              (enquiry.status || 'new')
                        }
                        onValueChange={(value) => handleStatusChange(enquiry.id, value as any)}
                      >
                        <SelectTrigger className="w-[120px] h-8 bg-white border-gray-200 text-[#1A2551] rounded-md text-xs font-medium focus:ring-1 focus:ring-[#1A2551]/20 shadow-sm transition-all hover:bg-gray-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 text-[#1A2551] min-w-[120px] p-1 shadow-xl rounded-lg">
                          <SelectItem value="new" className="text-[#1A2551] hover:bg-gray-100 focus:bg-gray-100 rounded-md cursor-pointer">New</SelectItem>
                          <SelectItem value="in_progress" className="hover:bg-gray-100 focus:bg-gray-100 rounded-md cursor-pointer">In Progress</SelectItem>
                          <SelectItem value="closed" className="text-[#1A2551] hover:bg-gray-100 focus:bg-gray-100 rounded-md cursor-pointer">Closed</SelectItem>
                        </SelectContent>
                      </Select>

                      <button
                        onClick={() => handleDeleteClick(enquiry)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body Section - Two Column Layout */}
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left Column: Contact Info */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</h4>
                      <div className="space-y-2">
                        <a href={`mailto:${enquiry.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1A2551] transition-colors">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{enquiry.email}</span>
                        </a>
                        {enquiry.phone && (
                          <a href={`tel:${enquiry.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#1A2551] transition-colors">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{enquiry.phone}</span>
                          </a>
                        )}
                        {enquiry.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{enquiry.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Details/Preferences */}
                    <div className="space-y-3">
                      {activeTab === 'newsletter' ? (
                        // Newsletter: Property Preferences
                        <>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Property Preferences</h4>
                          {hasPriorityAccess(enquiry) ? (
                            <div className="space-y-2">
                              {enquiry.price_range && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Banknote className="w-4 h-4 text-gray-400" />
                                  <span>{enquiry.price_range}</span>
                                </div>
                              )}
                              {enquiry.min_beds && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <BedDouble className="w-4 h-4 text-gray-400" />
                                  <span>{enquiry.min_beds}+ bedrooms</span>
                                </div>
                              )}
                              {enquiry.timeline && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>{enquiry.timeline}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">No preferences provided</p>
                          )}
                        </>
                      ) : (
                        // Enquiries: Interest & Property
                        <>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Inquiry Details</h4>
                          <div className="space-y-2">
                            {enquiry.property && (
                              <div className="flex items-start gap-2 text-sm">
                                <Home className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                  <span className="text-gray-500">Property: </span>
                                  <span className="text-[#1A2551] font-medium">{enquiry.property.title}</span>
                                </div>
                              </div>
                            )}
                            {/* Seller property details for valuation enquiries */}
                            {(enquiry.seller_house_number || enquiry.seller_postcode) && (
                              <div className="flex items-start gap-2 text-sm">
                                <Home className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                  <span className="text-gray-500">Property to Sell: </span>
                                  <span className="text-[#1A2551] font-medium">
                                    {enquiry.seller_house_number}{enquiry.seller_house_number && enquiry.seller_postcode ? ', ' : ''}{enquiry.seller_postcode}
                                  </span>
                                </div>
                              </div>
                            )}
                            {enquiry.inquiry_type && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="capitalize">{enquiry.inquiry_type.replace('_', ' ')} inquiry</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Message Section (Enquiries only, non-default messages) */}
                  {activeTab === 'enquiries' && enquiry.message &&
                   enquiry.message !== 'Newsletter subscription request.' &&
                   enquiry.message !== 'Newsletter subscription from Two Step Popup' &&
                   enquiry.message !== 'Newsletter subscription with Priority Access' && (
                    <div className="mt-5 pt-5 border-t border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Message</h4>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{enquiry.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </CMSPageLayout>

      <AlertDialog open={!!enquiryToDelete} onOpenChange={(open) => !open && setEnquiryToDelete(null)}>
        <AlertDialogContent className="bg-white border-2 border-[#1A2551]/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1A2551] text-xl font-bold">Delete Inquiry?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-base">
              Are you sure you want to delete the inquiry from <span className="font-semibold text-[#1A2551]">{enquiryToDelete?.name}</span>?
              This action cannot be undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
