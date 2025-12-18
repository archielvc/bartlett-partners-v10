import { useState, useEffect } from 'react';
import { Mail, Phone, Home, FileText, Filter, Database, Download, Users, MessageSquare, Trash2, Calendar as CalendarIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { CMSPageLayout } from '../CMSPageLayout';
import { Button } from '../../ui/button';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { cn } from '../../ui/utils';
import { format, differenceInDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { getContactSubmissions, updateContactSubmissionStatus, deleteContactSubmission } from '../../../utils/database';
import type { ContactSubmission, ContactSubmissionWithProperty } from '../../../types/database';

type FilterStatus = 'all' | 'new' | 'in_progress' | 'closed';
type TabType = 'enquiries' | 'newsletter';

export function CMSEnquiries() {
  const [enquiries, setEnquiries] = useState<ContactSubmissionWithProperty[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<TabType>('enquiries');
  const [loading, setLoading] = useState(true);

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
    await updateContactSubmissionStatus(id, newStatus);
    // Optimistic update
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await deleteContactSubmission(id);
      if (success) {
        setEnquiries(prev => prev.filter(e => e.id !== id));
        toast.success('Inquiry deleted successfully');
      } else {
        toast.error('Failed to delete inquiry');
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('An error occurred while deleting the inquiry');
    }
  };

  const handleExportNewNewsletters = () => {
    const newsletters = enquiries.filter(e => e.inquiry_type === 'newsletter' && e.status === 'new');

    if (newsletters.length === 0) {
      toast.error('No new newsletter sign-ups to export');
      return;
    }

    // Create CSV content
    const headers = ['Name', 'Email', 'Date', 'Time'];
    const rows = newsletters.map(n => [
      n.name,
      n.email,
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
  const filteredEnquiries = (activeTab === 'enquiries' ? realEnquiries : newsletters).filter(e => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'closed') {
        if (e.status !== 'closed' && e.status !== 'archived') return false;
      } else if (statusFilter === 'in_progress') {
        if (e.status !== 'in_progress' && e.status !== 'read' && e.status !== 'replied') return false;
      } else {
        if (e.status !== statusFilter) return false;
      }
    }

    if (dateFilter?.from) {
      const enquiryDate = new Date(e.created_at);
      enquiryDate.setHours(0, 0, 0, 0);

      const fromDate = new Date(dateFilter.from);
      fromDate.setHours(0, 0, 0, 0);

      if (enquiryDate < fromDate) return false;

      if (dateFilter.to) {
        const toDate = new Date(dateFilter.to);
        toDate.setHours(23, 59, 59, 999);
        if (enquiryDate > toDate) return false;
      }
    }

    return true;
  });

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
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"><Home className="w-3 h-3" /> Property Inquiry</span>;
      case 'valuation':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"><FileText className="w-3 h-3" /> Valuation Request</span>;
      case 'general':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"><Mail className="w-3 h-3" /> General Inquiry</span>;
    }
  };

  const newNewsletterCount = newsletters.filter(n => n.status === 'new').length;

  return (
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
            className="bg-[#C5A059] hover:bg-[#C5A059]/90 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
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
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${statusFilter === f
                ? 'bg-[#1A2551] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}

          <div className="h-6 w-px bg-gray-200 mx-2" />

          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                  dateFilter
                    ? "bg-[#1A2551] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <CalendarIcon className="w-4 h-4" />
                {dateFilter?.from ? (
                  dateFilter.to ? (
                    <>
                      {format(dateFilter.from, "LLL dd, y")} -{" "}
                      {format(dateFilter.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateFilter.from, "LLL dd, y")
                  )
                ) : (
                  "Select Dates"
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#1A2551] border border-[#1A2551] shadow-2xl rounded-xl overflow-hidden" align="start">
              <div className="flex flex-col">
                <Calendar
                  className="border-0 shadow-none rounded-b-none"
                  mode="range"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                  numberOfMonths={2}
                />
                <div className="border-t border-white/10 bg-[#1A2551] p-4 text-sm text-white font-medium text-center">
                  {dateFilter?.from ? (
                    dateFilter.to ? (
                      <span className="font-semibold text-[#C5A059]">
                        {differenceInDays(dateFilter.to, dateFilter.from) + 1} Days Selected
                      </span>
                    ) : (
                      <span className="text-white/60">Select end date</span>
                    )
                  ) : (
                    <span className="text-white/60">Select date range</span>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {dateFilter && (
            <button
              onClick={() => setDateFilter(undefined)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Clear date filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}
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
            <div key={enquiry.id} className={`bg-white p-6 rounded-xl border transition-all hover:shadow-md ${enquiry.status === 'new' ? 'border-l-4 border-l-[#C5A059] border-y-gray-100 border-r-gray-100' : 'border-gray-100'
              }`}>
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0
                    ${enquiry.status === 'new' ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'bg-gray-100 text-gray-500'}`}>
                    {enquiry.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-semibold text-[#1A2551] text-lg">{enquiry.name}</h3>
                      {getStatusBadge(enquiry.status)}
                      {activeTab === 'enquiries' && getTypeBadge(enquiry.inquiry_type, enquiry.property_id?.toString())}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                      <span title={new Date(enquiry.created_at).toLocaleString()}>
                        {new Date(enquiry.created_at).toLocaleDateString()} • {new Date(enquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <a href={`mailto:${enquiry.email}`} className="flex items-center gap-1 hover:text-[#1A2551]">
                        <Mail className="w-3.5 h-3.5" /> {enquiry.email}
                      </a>
                      {enquiry.phone && (
                        <a href={`tel:${enquiry.phone}`} className="flex items-center gap-1 hover:text-[#1A2551]">
                          <Phone className="w-3.5 h-3.5" /> {enquiry.phone}
                        </a>
                      )}
                    </div>

                    {enquiry.property && (
                      <div className="flex items-center gap-2 text-sm text-[#1A2551] bg-blue-50 px-3 py-1.5 rounded-md inline-block mt-1">
                        <Home className="w-4 h-4" />
                        <span className="font-medium">Property Inquiry:</span>
                        <span className="underline decoration-blue-300 underline-offset-2">{enquiry.property.title}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <select
                      value={
                        ['read', 'replied'].includes(enquiry.status || '') ? 'in_progress' :
                          ['archived'].includes(enquiry.status || '') ? 'closed' :
                            (enquiry.status || 'new')
                      }
                      onChange={(e) => handleStatusChange(enquiry.id, e.target.value as any)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#1A2551]"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>

                    <button
                      onClick={() => handleDelete(enquiry.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {activeTab === 'enquiries' && enquiry.message !== 'Newsletter subscription request.' && (
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{enquiry.message}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </CMSPageLayout>
  );
}