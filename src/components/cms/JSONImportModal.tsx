import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle2, Code, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface JSONImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  type: 'properties' | 'blog';
}

export function JSONImportModal({ isOpen, onClose, onImport, type }: JSONImportModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileStats, setFileStats] = useState<{ name: string; count: number; error?: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/json' || file.name.endsWith('.json')
    );

    if (droppedFiles.length === 0) {
      toast.error('Please upload valid JSON files');
      return;
    }

    handleFilesSelect(droppedFiles);
  };

  const handleFilesSelect = (newFiles: File[]) => {
    const allFiles = [...files, ...newFiles];
    setFiles(allFiles);
    setParseError(null);
    parseAllJSON(allFiles);
  };

  const parseAllJSON = (filesToParse: File[]) => {
    let allItems: any[] = [];
    const stats: { name: string; count: number; error?: string }[] = [];
    let filesProcessed = 0;

    filesToParse.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);

          // Handle both array and object with array property
          const items = Array.isArray(data) ? data : (data.properties || data.posts || data.items || []);

          if (!Array.isArray(items)) {
            stats.push({ name: file.name, count: 0, error: 'Not an array' });
          } else {
            stats.push({ name: file.name, count: items.length });
            allItems = [...allItems, ...items];
          }
        } catch (error) {
          stats.push({
            name: file.name,
            count: 0,
            error: error instanceof Error ? error.message : 'Parse error'
          });
        }

        filesProcessed++;
        if (filesProcessed === filesToParse.length) {
          setFileStats(stats);
          setPreviewData(allItems);

          const hasErrors = stats.some(s => s.error);
          if (hasErrors && allItems.length === 0) {
            setParseError('All files failed to parse. Check individual file errors below.');
          } else if (hasErrors) {
            toast.warning('Some files had errors, but others loaded successfully');
          }
        }
      };
      reader.readAsText(file);
    });
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);

    if (newFiles.length === 0) {
      setPreviewData([]);
      setFileStats([]);
      setParseError(null);
    } else {
      parseAllJSON(newFiles);
    }
  };

  const handleImport = async () => {
    try {
      setIsProcessing(true);
      await onImport(previewData);
      toast.success(`Successfully imported ${previewData.length} ${type === 'blog' ? 'articles' : 'properties'} from ${files.length} file(s)`);
      onClose();
      // Reset state
      setFiles([]);
      setPreviewData([]);
      setFileStats([]);
      setParseError(null);
    } catch (error) {
      console.error(error);
      toast.error('Import failed. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 font-sans">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1A2551] flex items-center gap-2">
            <Code className="w-5 h-5" />
            Import {type === 'blog' ? 'Articles' : 'Properties'} from JSON
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              JSON Import for Bulk Migration
            </p>
            <ul className="list-disc list-inside space-y-1 ml-1 text-blue-700/90">
              <li>Upload one or multiple JSON files containing {type === 'blog' ? 'blog posts' : 'properties'}.</li>
              <li>HTML content is supported for descriptions.</li>
              <li>Image URLs from the old site will be preserved.</li>
              <li>Slugs will be auto-generated if not provided.</li>
            </ul>
          </div>

          {files.length === 0 ? (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${isDragging ? 'border-[#1A2551] bg-[#1A2551]/5' : 'border-gray-300 hover:border-[#1A2551]'
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
                accept=".json,application/json"
                multiple
                onChange={(e) => e.target.files && handleFilesSelect(Array.from(e.target.files))}
              />
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Click to upload or drag and drop</h3>
              <p className="text-sm text-gray-500">JSON files only • Multiple files supported</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Uploaded Files ({files.length})</h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-[#1A2551] hover:underline"
                  >
                    + Add more files
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json,application/json"
                    multiple
                    onChange={(e) => e.target.files && handleFilesSelect(Array.from(e.target.files))}
                  />
                </div>

                {fileStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.error ? 'bg-red-100' : 'bg-purple-100'
                        }`}>
                        <Code className={`w-4 h-4 ${stat.error ? 'text-red-600' : 'text-purple-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{stat.name}</p>
                        <p className={`text-xs ${stat.error ? 'text-red-600' : 'text-gray-500'}`}>
                          {stat.error ? `Error: ${stat.error}` : `${stat.count} items`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {parseError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  {parseError}
                </div>
              ) : previewData.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Ready to Import
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-500">
                      Preview ({previewData.length} total items from {files.length} file{files.length !== 1 ? 's' : ''})
                    </div>
                    <div className="max-h-64 overflow-y-auto p-4 text-xs space-y-2">
                      {previewData.slice(0, 5).map((item, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded p-3">
                          <div className="font-semibold text-[#1A2551] mb-1">{item.title}</div>
                          <div className="text-gray-500 truncate">
                            {type === 'properties'
                              ? `£${Number(item.price).toLocaleString()} • ${item.beds} beds • ${item.baths} baths • ${item.location}`
                              : `${item.category || 'Insight'} • ${item.published_at || 'Draft'}`
                            }
                          </div>
                        </div>
                      ))}
                      {previewData.length > 5 && (
                        <div className="text-gray-400 italic pt-2 text-center">... and {previewData.length - 5} more</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!parseError && previewData.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-700 text-sm rounded-lg">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>This will add {previewData.length} new records from {files.length} file{files.length !== 1 ? 's' : ''}. Items with duplicate slugs will be skipped.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {files.length > 0 && !parseError && previewData.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleImport}
              disabled={isProcessing || previewData.length === 0}
              className="bg-[#1A2551] text-white hover:bg-[#1A2551]/90"
            >
              {isProcessing ? 'Importing...' : `Import ${previewData.length} Items`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}