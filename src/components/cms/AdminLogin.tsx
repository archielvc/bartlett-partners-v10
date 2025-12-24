import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useSiteSettings } from '../../contexts/SiteContext';

export function AdminLogin() {
  const { login, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'agent' | null>(null);
  const { images } = useSiteSettings();
  const blueLogo = images.branding.brand_logo_dark;

  const handleLogin = (role: 'admin' | 'agent') => {
    setSelectedRole(role);
    login(role);
  };

  return (
    <div className="min-h-screen w-full bg-[#1A2551] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm bg-white p-12 shadow-2xl flex flex-col items-center rounded-3xl"
      >
        {blueLogo ? (
          <img
            src={blueLogo}
            alt="Bartlett & Partners"
            className="h-16 w-auto mb-12"
          />
        ) : (
          <div className="text-2xl font-serif text-[#1A2551] mb-12">Bartlett & Partners</div>
        )}

        <div className="w-full space-y-4 flex flex-col items-center">
          <Button
            onClick={() => handleLogin('admin')}
            disabled={isLoading}
            className="w-full h-12 bg-[#1A2551] hover:bg-[#2A3561] text-white uppercase tracking-widest text-xs font-semibold rounded-lg transition-all duration-300"
          >
            {isLoading && selectedRole === 'admin' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Admin Portal'
            )}
          </Button>

          <Button
            onClick={() => handleLogin('agent')}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 border border-gray-200 text-gray-500 hover:border-[#C5A059] hover:text-[#C5A059] hover:bg-white uppercase tracking-widest text-xs font-semibold rounded-lg transition-all duration-300"
          >
            {isLoading && selectedRole === 'agent' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Agent Portal'
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
