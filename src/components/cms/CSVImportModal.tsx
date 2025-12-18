import { useState, useRef } from 'react';
import { Upload, X, FileText, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  type: 'properties' | 'testimonials' | 'blog';
}

export function CSVImportModal({ isOpen, onClose, onImport, type }: CSVImportModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const getTemplateHeaders = () => {
    switch (type) {
      case 'properties':
        return ['title', 'price', 'location', 'status', 'beds', 'baths', 'property_type', 'description', 'full_address', 'features'];
      case 'testimonials':
        return ['author', 'role', 'content', 'rating', 'published'];
      case 'blog':
        return ['title', 'excerpt', 'content', 'category', 'status', 'published_at'];
      default:
        return [];
    }
  };

  const getSampleRow = () => {
      switch (type) {
          case 'properties':
              return ['"Luxury Riverside Apartment"', '875000', '"Twickenham"', 'available', '3', '2', '"Apartment"', '"Stunning views..."', '"1 Riverside Walk"', '"Concierge; Gym; Balcony"'];
          case 'testimonials':
              return ['"John Smith"', '"Homeowner"', '"Excellent service..."', '5', 'true'];
          case 'blog':
              return ['"Market Update Q1"', '"Summary of market..."', '"Full article text..."', '"Insights"', 'published', '"2024-01-15"'];
          default:
              return [];
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      handleFileSelect(droppedFile);
    } else {
      toast.error('Please upload a valid CSV file');
    }
  };

  const handleFileSelect = (file: File) => {
    setFile(file);
    parseCSV(file);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
      
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        // Handle commas inside quotes
        const values: string[] = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim().replace(/^"|"$/g, '')); // Trim and remove surrounding quotes
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim().replace(/^"|"$/g, ''));

        const entry: any = {};
        headers.forEach((header, index) => {
          if (values[index]) {
             // Basic type conversion
             let val: any = values[index];
             if (!isNaN(Number(val)) && val !== '') val = Number(val);
             if (val === 'true') val = true;
             if (val === 'false') val = false;
             
             entry[header] = val;
          }
        });
        return entry;
      });
      setPreviewData(data);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    try {
      setIsProcessing(true);
      await onImport(previewData);
      toast.success(`Successfully imported ${previewData.length} items`);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const headers = getTemplateHeaders().join(',');
    const sample = getSampleRow().join(',');
    const csvContent = `${headers}\n${sample}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 font-sans">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1A2551]">Import {type === 'blog' ? 'Articles' : type.charAt(0).toUpperCase() + type.slice(1)} from CSV</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Help Text */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 space-y-2">
            <p className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Instructions
            </p>
            <ul className="list-disc list-inside space-y-1 ml-1 text-blue-700/90">
                <li>Download the template below to see the required format.</li>
                <li>Ensure headers match exactly.</li>
                {type === 'properties' && <li>Status must be: <code>available</code>, <code>under_offer</code>, <code>sold</code>, or <code>draft</code>.</li>}
                {type === 'properties' && <li>Price should be a number (no currency symbols).</li>}
                {type === 'properties' && <li>Key Features should be separated by semicolons (e.g., "Gym; Pool").</li>}
                {type === 'blog' && <li>Status must be: <code>published</code> or <code>draft</code>.</li>}
            </ul>
          </div>

          {!file ? (
            <div 
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                isDragging ? 'border-[#1A2551] bg-[#1A2551]/5' : 'border-gray-300 hover:border-[#1A2551]'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv" 
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Click to upload or drag and drop</h3>
              <p className="text-sm text-gray-500 mb-6">CSV files only</p>
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); downloadTemplate(); }} className="text-xs">
                <Download className="w-3 h-3 mr-2" />
                Download Template
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setPreviewData([]); }} className="text-gray-400 hover:text-red-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Ready to Import
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-500">
                        Preview ({previewData.length} items)
                    </div>
                    <div className="max-h-48 overflow-y-auto p-4 text-xs font-mono space-y-1">
                        {previewData.slice(0, 5).map((item, i) => (
                            <div key={i} className="truncate border-b border-gray-100 pb-1 last:border-0">
                                {JSON.stringify(item)}
                            </div>
                        ))}
                        {previewData.length > 5 && (
                            <div className="text-gray-400 italic pt-2">... and {previewData.length - 5} more</div>
                        )}
                    </div>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
                 <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                 <p>This will add {previewData.length} new records to your database. Existing records will not be modified.</p>
              </div>
            </div>
          )}
        </div>

        {file && (
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleImport} 
                    disabled={isProcessing || previewData.length === 0}
                    className="bg-[#1A2551] text-white hover:bg-[#1A2551]/90"
                >
                    {isProcessing ? 'Importing...' : 'Confirm Import'}
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}