import { useState } from 'react';
import { useAuth, AuthProvider } from '../../contexts/AuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import type { CMSView } from '../../types/cms';
import { SEOManager } from '../SEOManager';

// View Components (Lazy loaded or direct imports)
import { CMSProperties } from './views/CMSProperties';
import { PagesModule } from './PagesModule';
import { CMSEnquiries } from './views/CMSEnquiries';
import { CMSBlog } from './views/CMSBlog';
import { TestimonialsModule } from './TestimonialsModule';
import { CMSSettings } from './views/CMSSettings';
import { CMSSiteImages } from './views/CMSSiteImages';
import { CMSTeam } from './views/CMSTeam';


function AdminContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<CMSView>('properties');

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#1A2551] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

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
      <SEOManager title="CMS Panel - Bartlett & Partners" noindex={true} />
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