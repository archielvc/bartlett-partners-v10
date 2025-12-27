import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useSiteSettings } from '../../contexts/SiteContext';
import { SEOManager } from '../SEOManager';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { images } = useSiteSettings();
  const blueLogo = images.branding.brand_logo_dark;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || 'Invalid login credentials');
      } else {
        toast.success('Successfully signed in');
        // AuthContext will handle state change and redirection
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1A2551] flex items-center justify-center p-4">
      <SEOManager title="Login - Bartlett & Partners" noindex={true} />
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm bg-white p-12 shadow-2xl flex flex-col items-center rounded-3xl"
      >
        <Link to="/">
          {blueLogo ? (
            <img
              src={blueLogo}
              alt="Bartlett & Partners"
              className="h-16 w-auto mb-12"
            />
          ) : (
            <div className="text-2xl font-serif text-[#1A2551] mb-12 uppercase tracking-tighter">Bartlett <span className="text-[#C5A059]">&</span> Partners</div>
          )}
        </Link>

        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div className="space-y-2 text-center mb-6">
            <h1 className="text-xl font-semibold text-[#1A2551]">Welcome Back</h1>
            <p className="text-xs text-gray-500">Enter your credentials to access the portal</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2551]/10 focus:bg-white focus:border-[#1A2551]/20 transition-all duration-200"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2551]/10 focus:bg-white focus:border-[#1A2551]/20 transition-all duration-200"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#1A2551] hover:bg-[#2A3561] text-white uppercase tracking-widest text-xs font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#1A2551]/20 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Sign In to Portal'
            )}
          </Button>

          <p className="text-[10px] text-center text-gray-400 mt-8">
            This is a secure private system. Unauthorized access is prohibited.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
