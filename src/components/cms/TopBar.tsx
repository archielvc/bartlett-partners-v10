import { Eye, Upload, Save, CheckCircle, Loader2, User } from 'lucide-react';
import type { SaveStatus } from '../../App';

interface TopBarProps {
  saveStatus: SaveStatus;
  onSave: () => void;
  onPublish: () => void;
}

export function TopBar({ saveStatus, onSave, onPublish }: TopBarProps) {
  const getStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Draft Saved</span>
          </div>
        );
      case 'published':
        return (
          <div className="flex items-center gap-2 text-[#1A2551]">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Published</span>
          </div>
        );
      case 'unsaved':
        return (
          <div className="flex items-center gap-2 text-orange-600">
            <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
            <span className="text-sm">Unsaved Changes</span>
          </div>
        );
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Status Indicator */}
      <div className="flex items-center gap-4">
        {getStatusDisplay()}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <Save className="w-4 h-4" />
          <span className="text-sm font-medium">Save Changes</span>
        </button>

        <button
          onClick={onPublish}
          className="flex items-center gap-2 px-5 py-2 text-white bg-[#1A2551] rounded-lg hover:bg-[#1A2551]/90 transition-colors duration-200 shadow-sm"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">Publish</span>
        </button>

        {/* Profile Icon */}
        <div className="ml-3 w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      </div>
    </header>
  );
}