import { ReactNode } from 'react';
import { Button } from '../ui/button';
import { LucideIcon } from 'lucide-react';

interface CMSPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  action?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
  };
  actions?: Array<{
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'outline';
  }>;
}

export function CMSPageLayout({ title, description, children, action, actions }: CMSPageLayoutProps) {
  return (
    <div className="font-sans animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2551] mb-2 tracking-tight">{title}</h1>
          <p className="text-gray-500 text-lg font-light">{description}</p>
        </div>
        {(action || actions) && (
          <div className="flex items-center gap-3">
            {actions && actions.map((act, index) => (
              <Button 
                key={index}
                onClick={act.onClick}
                variant={act.variant || 'default'}
                className={`flex items-center gap-2 h-10 px-6 shadow-lg transition-all hover:-translate-y-0.5 rounded-lg font-medium ${
                  act.variant === 'outline' 
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50 shadow-gray-200/50' 
                    : 'bg-[#1A2551] text-white hover:bg-[#1A2551]/90 shadow-[#1A2551]/20'
                }`}
              >
                {act.icon && <act.icon className="w-4 h-4" />}
                <span>{act.label}</span>
              </Button>
            ))}
            {action && !actions && (
              <Button 
                onClick={action.onClick}
                className="flex items-center gap-2 h-10 px-6 bg-[#1A2551] text-white hover:bg-[#1A2551]/90 shadow-lg shadow-[#1A2551]/20 transition-all hover:-translate-y-0.5 rounded-lg"
              >
                {action.icon && <action.icon className="w-4 h-4" />}
                <span className="font-medium">{action.label}</span>
              </Button>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}