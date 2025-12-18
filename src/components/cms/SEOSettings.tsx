import { AlertCircle, CheckCircle, Upload } from 'lucide-react';

export function SEOSettings() {
  const seoIssues = [
    { page: 'Blog Archive', issue: 'Missing meta description', severity: 'high' },
    { page: 'Contact Page', issue: 'Short meta description (45 chars)', severity: 'medium' },
    { page: 'Property Details', issue: '3 images without alt text', severity: 'medium' },
    { page: 'Philosophy', issue: 'No canonical URL set', severity: 'low' },
  ];

  const indexedUrls = [
    { url: '/', status: 'indexed', lastCrawled: '2 days ago' },
    { url: '/about', status: 'indexed', lastCrawled: '3 days ago' },
    { url: '/properties', status: 'indexed', lastCrawled: '1 day ago' },
    { url: '/contact', status: 'indexed', lastCrawled: '4 days ago' },
    { url: '/blog', status: 'pending', lastCrawled: 'Never' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">SEO Settings</h1>
        <p className="text-gray-600">Manage global SEO defaults and site-wide optimization</p>
      </div>

      {/* Global Defaults */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Global SEO Defaults</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Title Format</label>
            <input
              type="text"
              defaultValue="%page_title% | Bartlett & Partners"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Use %page_title% as placeholder for page-specific titles</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Meta Description</label>
            <textarea
              rows={3}
              defaultValue="Luxury property sales and lettings in Richmond, Surrey, and London. Exceptional service for discerning clients."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Fallback description when page doesn't have a custom one</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default OG Image</label>
            <div className="flex items-center gap-4">
              <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600">
                /images/og-default.jpg
              </div>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                <Upload className="w-4 h-4 inline mr-2" />
                Change
              </button>
            </div>
          </div>
        </div>

        <button className="mt-6 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
          Save Global Settings
        </button>
      </div>

      {/* SEO Checklist */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">SEO Checklist</h2>
          <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium">
            Generate AI Suggestions
          </button>
        </div>

        <div className="space-y-3">
          {seoIssues.map((issue, index) => {
            const isHigh = issue.severity === 'high';
            const isMedium = issue.severity === 'medium';
            
            return (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  isHigh
                    ? 'border-red-200 bg-red-50'
                    : isMedium
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  isHigh
                    ? 'text-red-600'
                    : isMedium
                    ? 'text-orange-600'
                    : 'text-yellow-600'
                }`} />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{issue.page}</div>
                  <div className="text-sm text-gray-700 mt-0.5">{issue.issue}</div>
                </div>
                <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  Fix
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Site Index */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Site Index Status</h2>
        
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">URL</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Last Crawled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {indexedUrls.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">{item.url}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'indexed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.status === 'indexed' && <CheckCircle className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.lastCrawled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
