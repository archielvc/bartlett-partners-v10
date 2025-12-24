import { useState } from 'react';
import { useAuth, AuthProvider } from '../../contexts/AuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import type { CMSView } from '../../types/cms';

// View Components (Lazy loaded or direct imports)
import { CMSProperties } from './views/CMSProperties';
import { PagesModule } from './PagesModule';
import { CMSEnquiries } from './views/CMSEnquiries';
import { CMSBlog } from './views/CMSBlog';
import { TestimonialsModule } from './TestimonialsModule';
import { CMSSettings } from './views/CMSSettings';
import { CMSSiteImages } from './views/CMSSiteImages';
import { CMSTeam } from './views/CMSTeam';
import { CMSBulkImageUpload } from './views/CMSBulkImageUpload';


function AdminContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<CMSView>('properties');

  if (!user) {
    return <AdminLogin />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'properties':
        return <CMSProperties />;
      case 'enquiries':
        return <CMSEnquiries />;
      case 'seo':
        return <PagesModule />;
      case 'testimonials':
        return <TestimonialsModule />;
      case 'blog':
        return <CMSBlog />;
      case 'site-images':
        return <CMSSiteImages />;
      case 'settings':
        return <CMSSettings />;
      case 'team':
        return <CMSTeam />;
      case 'bulk-upload':
        return <CMSBulkImageUpload />;
      default:
        return (
          <div className="p-12 text-center text-gray-400">
            <h3 className="text-xl mb-2">Module Not Found</h3>
            <p>The {currentView} module is unavailable.</p>
          </div>
        );
    }
  };

  return (
    <AdminLayout currentView={currentView} onChangeView={setCurrentView}>
      {renderView()}
    </AdminLayout>
  );
}

export function AdminPanel() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}