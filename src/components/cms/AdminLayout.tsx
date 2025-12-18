import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Home, 
  MessageSquare, 
  Settings, 
  Users, 
  FileText, 
  LogOut, 
  Search,
  Globe,
  Film,
  BookOpen,
  Image,
  Quote,
  User
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import type { CMSView } from '../../types/cms';
import whiteLogo from "figma:asset/a49a304c14bdb50701e6c3c6ec4ac8419c70162c.png";
import { useNavigate } from 'react-router-dom';
import { NotificationBadge } from './NotificationBadge';

interface AdminLayoutProps {
  children: ReactNode;
  currentView: CMSView;
  onChangeView: (view: CMSView) => void;
}

export function AdminLayout({ children, currentView, onChangeView }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'properties' as CMSView, label: 'Properties', icon: Home, roles: ['admin', 'agent'] },
    { id: 'blog' as CMSView, label: 'Insights', icon: BookOpen, roles: ['admin', 'agent'] },
    { id: 'testimonials' as CMSView, label: 'Testimonials', icon: Quote, roles: ['admin', 'agent'] },
    { id: 'enquiries' as CMSView, label: 'Enquiries', icon: MessageSquare, roles: ['admin', 'agent'] },
    { id: 'site-images' as CMSView, label: 'Site Images', icon: Image, roles: ['admin'] },
    { id: 'seo' as CMSView, label: 'SEO Toolkit', icon: Search, roles: ['admin'] },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex font-sans" style={{ fontFamily: "'Figtree', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A2551] text-white flex flex-col fixed h-full z-50 shadow-2xl">
        <div className="p-6 flex flex-col items-center justify-center h-28 border-b border-white/5 bg-[#1A2551]">
          <img 
            src={whiteLogo} 
            alt="Bartlett & Partners" 
            className="h-16 w-auto cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
            onClick={() => navigate('/')}
          />
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1.5">
            {menuItems.filter(item => !item.roles || item.roles.includes(user?.role || '')).map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 rounded-lg group relative overflow-hidden",
                  currentView === item.id 
                    ? "bg-white text-[#1A2551] font-medium shadow-lg shadow-black/10" 
                    : "text-white/60 hover:text-white hover:bg-white/5 font-light"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 transition-colors",
                  currentView === item.id ? "text-[#C5A059]" : "text-current"
                )} />
                <span className="relative z-10">{item.label}</span>
                {item.id === 'enquiries' && <NotificationBadge />}
                {currentView === item.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C5A059]" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-white/5 bg-[#151e42]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C5A059] to-[#AA8A4D] flex items-center justify-center text-[#1A2551] font-bold text-sm shadow-md">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-white/90 truncate">{user?.name}</p>
              <p className="text-[10px] text-[#C5A059] capitalize tracking-wide">{user?.role}</p>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => onChangeView('settings')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={logout}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-10">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}