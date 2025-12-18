import { useState, useEffect } from 'react';
import { Plus, Trash2, Mail, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { get, set } from '../../../utils/kvStore';
import { CMSPageLayout } from '../CMSPageLayout';
import { Button } from '../../ui/button';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  status: 'active' | 'invited';
  lastActive?: string;
}

const MOCK_TEAM: TeamMember[] = [
  { id: 1, name: 'James Bartlett', email: 'james@bartlettandpartners.com', role: 'admin', status: 'active', lastActive: '2 mins ago' },
  { id: 2, name: 'Sarah Jenkins', email: 'sarah@bartlettandpartners.com', role: 'agent', status: 'active', lastActive: '1 hour ago' },
  { id: 3, name: 'New Agent', email: 'agent@example.com', role: 'agent', status: 'invited' },
];

const KV_KEY = 'team_members';

export function CMSTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'agent', name: '' });

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const data = await get<TeamMember[]>(KV_KEY);
      if (data) {
        setTeam(data);
      } else {
        setTeam(MOCK_TEAM);
      }
    } catch (error) {
      console.error('Failed to load team', error);
      setTeam(MOCK_TEAM);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTeam = async (newTeam: TeamMember[]) => {
    setTeam(newTeam);
    try {
      await set(KV_KEY, newTeam);
    } catch (error) {
      toast.error('Failed to save changes');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: TeamMember = {
      id: Date.now(),
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

  const handleRemove = async (id: number) => {
    const newTeam = team.filter(t => t.id !== id);
    await saveTeam(newTeam);
    toast.success('Team member removed');
  };

  return (
    <CMSPageLayout 
      title="Team Access" 
      description="Manage admin and agent access to the CMS."
      action={{ label: "Invite Member", icon: Plus, onClick: () => setIsInviting(true) }}
    >
      {isInviting && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 animate-in slide-in-from-top-4">
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
    </CMSPageLayout>
  );
}