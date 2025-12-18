import { Plus, Trash2, Bell, Shield, User, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getGlobalSettings, setGlobalSettings } from '../../utils/database';
import { CMSPageLayout } from './CMSPageLayout';
import { Button } from '../ui/button';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  status: 'active' | 'invited';
  lastActive?: string;
}

interface NotificationSettings {
  enquiryEmail: string;
  sendConfirmation: boolean;
  newsletterSync: boolean;
  newsletterProvider?: string;
  newsletterApiKey?: string;
  newsletterListId?: string;
}

const MOCK_TEAM: TeamMember[] = [
  { id: '1', name: 'James Bartlett', email: 'james@bartlettandpartners.com', role: 'admin', status: 'active', lastActive: '2 mins ago' },
  { id: '2', name: 'Sarah Jenkins', email: 'sarah@bartlettandpartners.com', role: 'agent', status: 'active', lastActive: '1 hour ago' },
  { id: '3', name: 'New Agent', email: 'agent@example.com', role: 'agent', status: 'invited' },
];

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  enquiryEmail: 'hello@bartlettandpartners.com',
  sendConfirmation: true,
  newsletterSync: false
};

const KV_KEY_TEAM = 'team_members';
const KV_KEY_NOTIFICATIONS = 'site_notifications';

export function SiteSettings() {
  const [activeTab, setActiveTab] = useState<'team' | 'notifications'>('team');
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'agent', name: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [teamData, notificationData] = await Promise.all([
        getGlobalSettings<TeamMember[]>(KV_KEY_TEAM),
        getGlobalSettings<NotificationSettings>(KV_KEY_NOTIFICATIONS),
      ]);
      
      if (teamData) {
        setTeam(teamData);
      } else {
        setTeam(MOCK_TEAM);
      }
      if (notificationData) setNotificationSettings(notificationData);
    } catch (error) {
      console.error('Failed to load settings', error);
      setTeam(MOCK_TEAM);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTeam = async (newTeam: TeamMember[]) => {
    setTeam(newTeam);
    try {
      await setGlobalSettings(KV_KEY_TEAM, newTeam);
      toast.success('Team updated successfully');
    } catch (error) {
      toast.error('Failed to save team changes');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: TeamMember = {
      id: Math.random().toString(),
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role as 'admin' | 'agent',
      status: 'invited'
    };
    const newTeam = [...team, newMember];
    await saveTeam(newTeam);
    
    setIsInviting(false);
    setInviteForm({ email: '', role: 'agent', name: '' });
    toast.success('Invitation sent successfully');
  };

  const handleRemove = async (id: string) => {
    const newTeam = team.filter(t => t.id !== id);
    await saveTeam(newTeam);
    toast.success('Team member removed');
  };

  const handleSaveNotifications = async () => {
    try {
      await setGlobalSettings(KV_KEY_NOTIFICATIONS, notificationSettings);
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to save notification settings');
    }
  };

  return (
    <CMSPageLayout 
      title="Settings" 
      description="Manage team access, notifications, and API integrations."
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {(['team', 'notifications'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'text-[#1A2551] border-b-2 border-[#1A2551]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'notifications' ? 'Notifications & API' : 'Team Access'}
          </button>
        ))}
      </div>

      {/* Team Access Tab */}
      {activeTab === 'team' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isInviting && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 animate-in slide-in-from-top-4">
              <h3 className="text-lg font-medium text-[#1A2551] mb-4">Invite New Team Member</h3>
              <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteForm.name}
                    onChange={e => setInviteForm({...inviteForm, name: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={e => setInviteForm({...inviteForm, role: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059]"
                  >
                    <option value="agent">Agent</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-[#1A2551] text-white flex-1">Send Invite</Button>
                  <Button type="button" variant="outline" onClick={() => setIsInviting(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-200/60 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-[#1A2551]">Team Members</h3>
                <p className="text-sm text-gray-500 mt-1">Manage admin and agent access to the CMS.</p>
              </div>
              <Button 
                onClick={() => setIsInviting(true)}
                className="bg-[#1A2551] text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Invite Member
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th className="text-right py-5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {team.map((member) => (
                    <tr key={member.id} className="hover:bg-[#F5F6F8] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1A2551]/5 flex items-center justify-center text-[#1A2551] font-bold text-xs ring-2 ring-white shadow-sm group-hover:ring-[#C5A059]/20 transition-all">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-[#1A2551]">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {member.role === 'admin' ? 'Administrator' : 'Agent'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          {member.status === 'active' ? 'Active' : 'Invited'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {member.lastActive || '-'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleRemove(member.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Notifications & API Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-3xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#1A2551]" />
              Email Notifications
            </h2>
            
            <div className="space-y-6">
              {/* Enquiry Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enquiry Notification Email
                </label>
                <input
                  type="email"
                  value={notificationSettings.enquiryEmail}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, enquiryEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                  placeholder="enquiries@bartlettandpartners.com"
                />
                <p className="text-xs text-gray-500 mt-1">All property enquiries will be sent to this email address.</p>
              </div>

              {/* Send Confirmation */}
              <div className="flex items-start gap-3 py-4">
                <input
                  type="checkbox"
                  id="sendConfirmation"
                  checked={notificationSettings.sendConfirmation}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, sendConfirmation: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-[#1A2551] border-gray-300 rounded focus:ring-[#1A2551] accent-[#1A2551]"
                />
                <div className="flex-1">
                  <label htmlFor="sendConfirmation" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Send confirmation emails to users
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically send a confirmation email when someone submits an enquiry.
                  </p>
                </div>
              </div>

              {/* Newsletter Sync */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Newsletter Integration</h3>
                
                <div className="flex items-start gap-3 py-4">
                  <input
                    type="checkbox"
                    id="newsletterSync"
                    checked={notificationSettings.newsletterSync}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, newsletterSync: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-[#1A2551] border-gray-300 rounded focus:ring-[#1A2551] accent-[#1A2551]"
                  />
                  <div className="flex-1">
                    <label htmlFor="newsletterSync" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Sync enquiries to newsletter list
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically add enquiry contacts to your newsletter mailing list.
                    </p>
                  </div>
                </div>

                {notificationSettings.newsletterSync && (
                  <div className="space-y-4 ml-7 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provider
                      </label>
                      <select
                        value={notificationSettings.newsletterProvider || 'mailchimp'}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, newsletterProvider: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                      >
                        <option value="mailchimp">Mailchimp</option>
                        <option value="sendgrid">SendGrid</option>
                        <option value="klaviyo">Klaviyo</option>
                        <option value="convertkit">ConvertKit</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={notificationSettings.newsletterApiKey || ''}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, newsletterApiKey: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent font-mono text-sm"
                        placeholder="sk_live_..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        List/Audience ID
                      </label>
                      <input
                        type="text"
                        value={notificationSettings.newsletterListId || ''}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, newsletterListId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent font-mono text-sm"
                        placeholder="abc123..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSaveNotifications}
                className="mt-6 px-6 py-2.5 bg-[#1A2551] text-white rounded-lg hover:bg-[#1A2551]/90 transition-colors font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Notification Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </CMSPageLayout>
  );
}