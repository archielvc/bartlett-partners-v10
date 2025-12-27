import { useState, useEffect } from 'react';
import { Save, Users, Shield, Trash2, Loader2, ShieldCheck, ShieldAlert, CheckCircle2, Info, Bell, Mail } from 'lucide-react';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { CMSPageLayout } from '../CMSPageLayout';
import { supabase } from '../../../utils/supabase/client';
import { useAuth, UserRole } from '../../../contexts/AuthContext';
import { getGlobalSettings, setGlobalSettings } from '../../../utils/database';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

interface NotificationSettings {
  enquiryEmail: string;
  sendConfirmation: boolean;
  newsletterSync: boolean;
  newsletterProvider?: string;
  newsletterApiKey?: string;
  newsletterListId?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  enquiryEmail: 'hello@bartlettandpartners.com',
  sendConfirmation: true,
  newsletterSync: false
};

const KV_KEY_NOTIFICATIONS = 'site_notifications';

interface PermissionRole {
  id: UserRole;
  name: string;
  description: string;
  permissions: string[];
}

const ROLES_INFO: PermissionRole[] = [
  {
    id: 'administrator',
    name: 'Administrator',
    description: 'Full access to all CMS features, settings, and SEO tools.',
    permissions: ['Properties', 'Insights', 'Testimonials', 'Enquiries', 'Team Bios', 'Site Images', 'SEO Toolkit', 'System Settings']
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Can manage content but restricted from system settings and site assets.',
    permissions: ['Properties', 'Insights', 'Testimonials', 'Enquiries']
  }
];

export function CMSSettings() {
  const [activeTab, setActiveTab] = useState<'team' | 'roles' | 'notifications'>('team');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const [profilesResponse, notificationData] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),
        getGlobalSettings<NotificationSettings>(KV_KEY_NOTIFICATIONS),
      ]);

      if (profilesResponse.data) {
        setProfiles(profilesResponse.data as UserProfile[]);
      }

      if (notificationData) setNotificationSettings(notificationData);
    } catch (error) {
      console.error('Failed to load settings', error);
      toast.error('Failed to load some settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (profileId: string, newRole: UserRole) => {
    if (profileId === currentUser?.id) {
      toast.error("You cannot change your own role");
      return;
    }

    setIsSaving(profileId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(profiles.map(p => p.id === profileId ? { ...p, role: newRole } : p));
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setIsSaving(null);
    }
  };

  const handleRemoveUser = async (profileId: string) => {
    if (profileId === currentUser?.id) {
      toast.error("You cannot remove yourself");
      return;
    }

    if (!confirm('Are you sure you want to remove this user? This will remove their CMS access. Their auth account will remain but they won\'t be able to log in without a profile.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(profiles.filter(p => p.id !== profileId));
      toast.success('User access removed');
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      await setGlobalSettings(KV_KEY_NOTIFICATIONS, notificationSettings);
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to save notification settings');
    } finally {
      setIsSavingNotifications(false);
    }
  };

  if (currentUser?.role !== 'administrator') {
    return (
      <CMSPageLayout title="Access Denied" description="Restricted area">
        <div className="bg-red-50 p-12 rounded-2xl border border-red-100 flex flex-col items-center text-center max-w-2xl mx-auto mt-12">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Restricted Access</h2>
          <p className="text-red-700">Only administrators have permission to access system settings and team management.</p>
        </div>
      </CMSPageLayout>
    );
  }

  return (
    <CMSPageLayout
      title="Settings"
      description="Manage team access, permissions, and system settings"
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 bg-white p-1 rounded-lg border border-gray-200 w-fit">
        <button
          onClick={() => setActiveTab('team')}
          className={`px-6 py-2.5 rounded-md transition-all font-medium text-sm flex items-center gap-2 ${activeTab === 'team'
            ? 'bg-[#1A2551] text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <Users className="w-4 h-4" />
          Team Access
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-6 py-2.5 rounded-md transition-all font-medium text-sm flex items-center gap-2 ${activeTab === 'roles'
            ? 'bg-[#1A2551] text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <Shield className="w-4 h-4" />
          Permission Roles
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-6 py-2.5 rounded-md transition-all font-medium text-sm flex items-center gap-2 ${activeTab === 'notifications'
            ? 'bg-[#1A2551] text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <Bell className="w-4 h-4" />
          Notifications & API
        </button>
      </div>

      {/* Team Access Tab */}
      {activeTab === 'team' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#1A2551]">Team Members</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage who has access to your CMS and their specific role
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected to Supabase Auth
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role & Permissions
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Member Since
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-300" />
                      <p className="text-sm text-gray-400 mt-2">Loading profiles...</p>
                    </td>
                  </tr>
                ) : profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A2551]/10 to-[#1A2551]/5 flex items-center justify-center text-[#1A2551] font-bold text-xs ring-2 ring-white shadow-sm transition-all group-hover:scale-105">
                          {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[#1A2551] flex items-center gap-2">
                            {profile.full_name || 'Unnamed User'}
                            {profile.id === currentUser?.id && (
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">You</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{profile.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <select
                          value={profile.role}
                          onChange={(e) => handleUpdateRole(profile.id, e.target.value as UserRole)}
                          disabled={isSaving === profile.id || profile.id === currentUser?.id}
                          className={`text-sm font-medium px-4 py-1.5 rounded-lg border focus:outline-none transition-all w-48 ${profile.role === 'administrator'
                            ? 'bg-purple-50 text-purple-700 border-purple-100 focus:ring-purple-200'
                            : 'bg-blue-50 text-blue-700 border-blue-100 focus:ring-blue-200'
                            }`}
                        >
                          <option value="administrator">Administrator</option>
                          <option value="editor">Editor</option>
                        </select>
                        <div className="flex gap-1.5">
                          {ROLES_INFO.find(r => r.id === profile.role)?.permissions.slice(0, 3).map(p => (
                            <span key={p} className="text-[9px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{p}</span>
                          ))}
                          <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">+ more</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRemoveUser(profile.id)}
                          className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-600 rounded-lg transition-colors"
                          title="Remove Access"
                          disabled={profile.id === currentUser?.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-8 bg-[#F8FAFC] border-t border-gray-100">
              <div className="flex gap-6 items-start">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Info className="w-5 h-5 text-[#1A2551]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A2551] mb-1">Adding New Members</h4>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                    Bartlett & Partners uses a secure registration flow. New team members should use the registration link on the login page to create an account. Once registered, they will appear here as an 'Editor' by default, and you can upgrade their permissions as needed.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 text-xs h-8"
                    onClick={() => {
                      window.open('/admin', '_blank');
                      toast.info("Registration is handled via the main login screen.");
                    }}
                  >
                    Open Login / Registration
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permission Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-xl font-semibold text-[#1A2551]">Role Definitions</h2>
            <p className="text-sm text-gray-500 mt-1">
              Currently available roles and their pre-defined logic
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROLES_INFO.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm relative overflow-hidden group hover:border-[#C5A059]/30 transition-all"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-110 ${role.id === 'administrator' ? 'bg-purple-600' : 'bg-blue-600'
                  }`} />

                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${role.id === 'administrator' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                    {role.id === 'administrator' ? <ShieldCheck className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1A2551]">{role.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold font-sans mt-0.5">System Wide Role</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-8">
                  {role.description}
                </p>

                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                    Scope of Access
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((perm) => (
                      <span
                        key={perm}
                        className={`text-[11px] px-2.5 py-1 rounded-md font-medium border ${role.id === 'administrator'
                          ? 'bg-purple-50/30 text-purple-700 border-purple-100/50'
                          : 'bg-blue-50/30 text-blue-700 border-blue-100/50'
                          }`}
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4 items-start">
            <div className="p-2 bg-white rounded-full shadow-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900 mb-1">Role Hardcoding</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Roles are currently enforced within the application core. Editors are strictly prohibited from accessing "Site Images" and the "SEO Toolkit" regardless of these display labels. System-wide settings and team management are reserved for Administrators.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications & API Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm transition-all overflow-hidden relative">
          <div className="max-w-3xl relative z-10">
            <h2 className="text-xl font-bold text-[#1A2551] mb-8 flex items-center gap-3">
              <div className="p-2 bg-[#1A2551]/5 rounded-lg">
                <Bell className="w-6 h-6 text-[#1A2551]" />
              </div>
              Email Notifications
            </h2>

            <div className="space-y-8">
              {/* Enquiry Email */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Enquiry Destination
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono uppercase">KV STORE: {KV_KEY_NOTIFICATIONS}</span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 transition-colors group-focus-within:text-[#1A2551]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={notificationSettings.enquiryEmail}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, enquiryEmail: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1A2551]/5 focus:bg-white focus:border-[#C5A059]/50 transition-all duration-300"
                    placeholder="enquiries@bartlettandpartners.com"
                  />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed px-1">All property enquiries and contact forms will be routed to this address. Ensure this is a monitored mailbox.</p>
              </div>

              {/* Send Confirmation */}
              <div className="flex items-start gap-4 p-5 bg-[#F8FAFC] rounded-2xl border border-gray-100 group hover:border-[#C5A059]/30 transition-all cursor-pointer" onClick={() => setNotificationSettings({ ...notificationSettings, sendConfirmation: !notificationSettings.sendConfirmation })}>
                <div className={`mt-1 h-5 w-5 rounded border flex items-center justify-center transition-all ${notificationSettings.sendConfirmation ? 'bg-[#1A2551] border-[#1A2551]' : 'bg-white border-gray-300'}`}>
                  {notificationSettings.sendConfirmation && <div className="w-2.5 h-2.5 bg-[#C5A059] rounded-full scale-75 animate-in zoom-in" />}
                </div>
                <div className="flex-1">
                  <label className="text-sm font-bold text-[#1A2551] block mb-1">
                    Automated Confirmation Emails
                  </label>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Automatically send a "Brand Neutral" confirmation email to users when they submit an enquiry. This improves perceived responsiveness.
                  </p>
                </div>
              </div>

              {/* Newsletter Sync */}
              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-sm font-bold text-[#1A2551] uppercase tracking-wider mb-6 flex items-center gap-2 px-1">
                  CRM & Newsletter Sync
                  <div className="px-2 py-0.5 bg-gray-100 text-[9px] rounded text-gray-400">External API</div>
                </h3>

                <div className="flex items-start gap-4 p-5 bg-[#F8FAFC] rounded-2xl border border-gray-100 group hover:border-[#C5A059]/30 transition-all cursor-pointer mb-6" onClick={() => setNotificationSettings({ ...notificationSettings, newsletterSync: !notificationSettings.newsletterSync })}>
                  <div className={`mt-1 h-5 w-5 rounded border flex items-center justify-center transition-all ${notificationSettings.newsletterSync ? 'bg-[#1A2551] border-[#1A2551]' : 'bg-white border-gray-300'}`}>
                    {notificationSettings.newsletterSync && <div className="w-2.5 h-2.5 bg-[#C5A059] rounded-full scale-75 animate-in zoom-in" />}
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-bold text-[#1A2551] block mb-1">
                      Real-time Mailing List Sync
                    </label>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Automatically add enquiry data and contact information to your target mailing list provider via API.
                    </p>
                  </div>
                </div>

                {notificationSettings.newsletterSync && (
                  <div className="space-y-6 p-8 bg-white border border-[#C5A059]/20 rounded-2xl shadow-xl shadow-[#1A2551]/5 animate-in fade-in zoom-in-95 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#1A2551] uppercase tracking-widest px-1">
                          Integration Provider
                        </label>
                        <select
                          value={notificationSettings.newsletterProvider || 'mailchimp'}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, newsletterProvider: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1A2551]/5 focus:border-[#C5A059]/50 transition-all"
                        >
                          <option value="mailchimp">Mailchimp</option>
                          <option value="sendgrid">SendGrid</option>
                          <option value="klaviyo">Klaviyo</option>
                          <option value="convertkit">ConvertKit</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#1A2551] uppercase tracking-widest px-1">
                          Audience / List ID
                        </label>
                        <input
                          type="text"
                          value={notificationSettings.newsletterListId || ''}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, newsletterListId: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1A2551]/5 focus:border-[#C5A059]/50 transition-all font-mono"
                          placeholder="abc123fed456"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#1A2551] uppercase tracking-widest px-1 flex justify-between">
                        Secret API Key
                        <span className="text-[9px] text-amber-600 flex items-center gap-1 font-sans"><ShieldAlert className="w-3 h-3" /> Never share this publicly</span>
                      </label>
                      <input
                        type="password"
                        value={notificationSettings.newsletterApiKey || ''}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, newsletterApiKey: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#1A2551]/5 focus:border-[#C5A059]/50 transition-all font-mono"
                        placeholder="sk_live_..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-10 border-t border-gray-100 flex justify-end">
                <Button
                  onClick={handleSaveNotifications}
                  disabled={isSavingNotifications}
                  className="px-10 py-4 bg-[#1A2551] text-white rounded-xl hover:bg-[#1A2551]/90 transition-all duration-300 font-bold flex items-center gap-3 shadow-2xl shadow-[#1A2551]/20 hover:-translate-y-1"
                >
                  {isSavingNotifications ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save All Settings
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />
        </div>
      )}
    </CMSPageLayout>
  );
}