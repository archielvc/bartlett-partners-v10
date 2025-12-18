import { useState, useCallback } from 'react';
import { X, Monitor, Tablet, Smartphone, RefreshCw, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type DeviceView = 'desktop' | 'tablet' | 'mobile';

interface FrontendPreviewProps {
  onClose: () => void;
}

export function FrontendPreview({ onClose }: FrontendPreviewProps) {
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  const [inputUrl, setInputUrl] = useState('/');
  const navigate = useNavigate();

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newUrl = inputUrl.trim();

    // Ensure URL starts with /
    if (!newUrl.startsWith('/')) {
      newUrl = '/' + newUrl;
    }

    // Open in a new window instead of navigating within preview
    window.open(newUrl, '_blank');
  };

  const handleRefresh = () => {
    // Refresh the current preview
    window.location.reload();
  };

  const handleOpenInNewTab = () => {
    window.open(inputUrl, '_blank');
  };

  const handleNavigateToUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const getDeviceWidth = () => {
    switch (deviceView) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
        return '100%';
    }
  };

  const getDeviceHeight = () => {
    switch (deviceView) {
      case 'mobile':
        return '667px';
      case 'tablet':
        return '1024px';
      case 'desktop':
        return '100%';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a1a] z-[100] flex flex-col">
      {/* Preview Controls Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 whitespace-nowrap">Live Site Preview</h2>
          <div className="h-6 w-px bg-gray-300"></div>

          {/* URL Bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter URL to test (e.g., /, /properties, /about)"
                className="w-full px-4 py-2 pr-24 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  type="submit"
                  className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                  title="Open URL in new tab"
                >
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </form>

          <div className="h-6 w-px bg-gray-300"></div>

          {/* Device Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`p-2 rounded transition-colors ${deviceView === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() => setDeviceView('tablet')}
              className={`p-2 rounded transition-colors ${deviceView === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`p-2 rounded transition-colors ${deviceView === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
        >
          <X className="w-4 h-4" />
          <span className="text-sm font-medium">Exit Preview</span>
        </button>
      </div>

      {/* Preview Information */}
      <div className="flex-1 bg-[#2a2a2a] overflow-auto flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[#1A2551] rounded-full flex items-center justify-center mx-auto">
            <ExternalLink className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-gray-900">Preview Your Site</h3>
            <p className="text-gray-600">
              Enter a URL above and press Enter or click the external link icon to open a preview in a new tab.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <p className="text-sm text-gray-500 font-medium">Quick Links:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleNavigateToUrl('/')}
                className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700 border border-gray-200"
              >
                🏠 Home
              </button>
              <button
                onClick={() => handleNavigateToUrl('/properties')}
                className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700 border border-gray-200"
              >
                🏘️ Properties
              </button>
              <button
                onClick={() => handleNavigateToUrl('/about')}
                className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700 border border-gray-200"
              >
                👥 Philosophy
              </button>
              <button
                onClick={() => handleNavigateToUrl('/insights')}
                className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700 border border-gray-200"
              >
                💡 Insights
              </button>
              <button
                onClick={() => handleNavigateToUrl('/contact')}
                className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700 border border-gray-200"
              >
                📞 Contact
              </button>
              <button
                onClick={() => handleNavigateToUrl('/properties/1')}
                className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700 border border-gray-200"
              >
                🏡 Property Detail
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Preview opens in a new tab so you can test the full site experience including animations, navigation, and all interactive features.
            </p>
          </div>
        </div>
      </div>

      {/* Device Info Bar */}
      {deviceView !== 'desktop' && (
        <div className="bg-gray-800 text-gray-400 text-xs text-center py-2 border-t border-gray-700 flex-shrink-0">
          {deviceView === 'mobile' && 'Device preview: iPhone SE (375px × 667px)'}
          {deviceView === 'tablet' && 'Device preview: iPad (768px × 1024px)'}
        </div>
      )}
    </div>
  );
}
