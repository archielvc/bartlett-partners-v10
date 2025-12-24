import { useState, useEffect } from 'react';
import { Save, Users, Shield, Mail, Trash2, Plus, Edit, X, Lock, UserPlus, Crown, CheckCircle2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { CMSPageLayout } from '../CMSPageLayout';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  status: 'active' | 'pending';
  addedDate: string;
  lastActive?: string;
}

interface PermissionRole {
  id: string;
  name: string;
  description: string;
  permissions: {
    properties: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    blog: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    testimonials: {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
    };
    enquiries: {
      view: boolean;
      export: boolean;
    };
    seo: {
      access: boolean;
    };
    settings: {
      access: boolean;
    };
  };
}

const TEAM_STORAGE_KEY = 'team_members';
const ROLES_STORAGE_KEY = 'permission_roles';
const ROLES_VERSION_KEY = 'permission_roles_version';
const CURRENT_ROLES_VERSION = '2'; // Increment this when roles change

const defaultRoles: PermissionRole[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features and settings',
    permissions: {
      properties: { view: true, create: true, edit: true, delete: true },
      blog: { view: true, create: true, edit: true, delete: true },
      testimonials: { view: true, create: true, edit: true, delete: true },
      enquiries: { view: true, export: true },
      seo: { access: true },
      settings: { access: true },
    },
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Full control over content, no system access',
    permissions: {
      properties: { view: true, create: true, edit: true, delete: true },
      blog: { view: true, create: true, edit: true, delete: true },
      testimonials: { view: true, create: true, edit: true, delete: true },
      enquiries: { view: true, export: true },
      seo: { access: false },
      settings: { access: false },
    },
  },
];

export function CMSSettings() {
  const [activeTab, setActiveTab] = useState<'team' | 'roles'>('team');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [roles, setRoles] = useState<PermissionRole[]>(defaultRoles);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingRole, setEditingRole] = useState<PermissionRole | null>(null);

  // Form state for adding team member
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'editor' as 'admin' | 'editor',
  });

  useEffect(() => {
    loadTeamMembers();
    loadRoles();
  }, []);

  const loadTeamMembers = () => {
    const stored = localStorage.getItem(TEAM_STORAGE_KEY);
    if (stored) {
      setTeamMembers(JSON.parse(stored));
    } else {
      // Set default team member (current user as admin)
      const defaultTeam: TeamMember[] = [
        {
          id: 1,
          name: 'Darren Bartlett',
          email: 'darren@bartlettandpartners.co.uk',
          role: 'admin',
          status: 'active',
          addedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        },
      ];
      setTeamMembers(defaultTeam);
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(defaultTeam));
    }
  };

  const loadRoles = () => {
    const stored = localStorage.getItem(ROLES_STORAGE_KEY);
    const storedVersion = localStorage.getItem(ROLES_VERSION_KEY);
    if (stored && storedVersion === CURRENT_ROLES_VERSION) {
      const storedRoles = JSON.parse(stored);
      // Filter to only keep admin and editor roles
      const filteredRoles = storedRoles.filter((role: PermissionRole) =>
        role.id === 'admin' || role.id === 'editor'
      );
      // If we have both roles, use them; otherwise reset to defaults
      if (filteredRoles.length === 2) {
        setRoles(filteredRoles);
      } else {
        setRoles(defaultRoles);
        localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(defaultRoles));
        localStorage.setItem(ROLES_VERSION_KEY, CURRENT_ROLES_VERSION);
      }
    } else {
      setRoles(defaultRoles);
      localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(defaultRoles));
      localStorage.setItem(ROLES_VERSION_KEY, CURRENT_ROLES_VERSION);
    }
  };

  const saveTeamMembers = (members: TeamMember[]) => {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(members));
    setTeamMembers(members);
  };

  const saveRoles = (updatedRoles: PermissionRole[]) => {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(updatedRoles));
    setRoles(updatedRoles);
  };

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) {
      toast.error('Name and email are required');
      return;
    }

    // Check if email already exists
    if (teamMembers.some(m => m.email === newMember.email)) {
      toast.error('A team member with this email already exists');
      return;
    }

    const member: TeamMember = {
      id: Date.now(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: 'pending',
      addedDate: new Date().toISOString(),
    };

    saveTeamMembers([...teamMembers, member]);
    setNewMember({ name: '', email: '', role: 'editor' });
    setShowAddMember(false);
    toast.success(`Invitation sent to ${member.email}`);
  };

  const handleDeleteMember = (id: number) => {
    const member = teamMembers.find(m => m.id === id);
    if (!member) return;

    if (member.role === 'admin' && teamMembers.filter(m => m.role === 'admin').length === 1) {
      toast.error('Cannot remove the last administrator');
      return;
    }

    if (confirm(`Remove ${member.name} from the team?`)) {
      saveTeamMembers(teamMembers.filter(m => m.id !== id));
      toast.success('Team member removed');
    }
  };

  const handleUpdateMemberRole = (id: number, newRole: 'admin' | 'editor') => {
    const member = teamMembers.find(m => m.id === id);
    if (!member) return;

    if (member.role === 'admin' && newRole !== 'admin' && teamMembers.filter(m => m.role === 'admin').length === 1) {
      toast.error('Cannot demote the last administrator');
      return;
    }

    const updated = teamMembers.map(m =>
      m.id === id ? { ...m, role: newRole } : m
    );
    saveTeamMembers(updated);
    toast.success('Role updated');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'editor':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3.5 h-3.5" />;
      case 'editor':
        return <Edit className="w-3.5 h-3.5" />;
      default:
        return <Shield className="w-3.5 h-3.5" />;
    }
  };

  return (
    <CMSPageLayout
      title="Settings"
      description="Manage team access, permissions, and system settings"
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 bg-white p-1 rounded-lg border border-gray-200 w-fit">
        <button
          onClick={() => setActiveTab('team')}
          className={`px-6 py-2.5 rounded-md transition-all font-medium text-sm ${activeTab === 'team'
              ? 'bg-[#1A2551] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <Users className="w-4 h-4 inline-block mr-2" />
          Team Access
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-6 py-2.5 rounded-md transition-all font-medium text-sm ${activeTab === 'roles'
              ? 'bg-[#1A2551] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          <Shield className="w-4 h-4 inline-block mr-2" />
          Permission Roles
        </button>
      </div>

      {/* Team Access Tab */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage who has access to your CMS and what they can do
              </p>
            </div>
            <Button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-2 h-10 px-6 bg-[#1A2551] text-white hover:bg-[#1A2551]/90 shadow-lg shadow-[#1A2551]/20 transition-all hover:-translate-y-0.5 rounded-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span className="font-medium">Invite Member</span>
            </Button>
          </div>

          {/* Team Members List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1A2551] text-white flex items-center justify-center font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as any)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#1A2551] focus:border-transparent cursor-pointer"
                        >
                          <option value="admin">Administrator</option>
                          <option value="editor">Editor</option>
                        </select>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                          {member.role === 'admin' ? 'Administrator' : 'Editor'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Remove Member"
                          disabled={member.role === 'admin' && teamMembers.filter(m => m.role === 'admin').length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permission Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Permission Roles</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure what each role can access and modify
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#1A2551] transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${getRoleBadgeColor(role.id)}`}>
                      {getRoleIcon(role.id)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{role.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Permissions
                  </div>

                  {/* Properties */}
                  <div className="pb-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700 mb-2">Properties</div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.properties.view && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">View</span>
                      )}
                      {role.permissions.properties.create && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Create</span>
                      )}
                      {role.permissions.properties.edit && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Edit</span>
                      )}
                      {role.permissions.properties.delete && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Delete</span>
                      )}
                    </div>
                  </div>

                  {/* Blog */}
                  <div className="pb-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700 mb-2">Blog & Insights</div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.blog.view && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">View</span>
                      )}
                      {role.permissions.blog.create && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Create</span>
                      )}
                      {role.permissions.blog.edit && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Edit</span>
                      )}
                      {role.permissions.blog.delete && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Delete</span>
                      )}
                    </div>
                  </div>

                  {/* Testimonials */}
                  <div className="pb-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700 mb-2">Testimonials</div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.testimonials.view && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">View</span>
                      )}
                      {role.permissions.testimonials.create && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Create</span>
                      )}
                      {role.permissions.testimonials.edit && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Edit</span>
                      )}
                      {role.permissions.testimonials.delete && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Delete</span>
                      )}
                    </div>
                  </div>

                  {/* Enquiries */}
                  <div className="pb-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700 mb-2">Enquiries</div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.enquiries.view && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">View</span>
                      )}
                      {role.permissions.enquiries.export && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Export</span>
                      )}
                    </div>
                  </div>

                  {/* System Access */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">System</div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.seo.access && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">SEO Toolkit</span>
                      )}
                      {role.permissions.settings.access && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Settings</span>
                      )}
                      {!role.permissions.seo.access && !role.permissions.settings.access && (
                        <span className="text-xs text-gray-400">No system access</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Clear Local Data Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Browser Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Clear cached data stored in your browser. This removes any local test data and ensures you're only using data from the database.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                toast.success('Local storage cleared! Refreshing page...');
                setTimeout(() => window.location.reload(), 1000);
              }}
              className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
            >
              Clear Local Data & Refresh
            </button>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Invite Team Member</h2>
              <button
                onClick={() => setShowAddMember(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="John Smith"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A2551] focus:border-transparent"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {newMember.role === 'admin' && 'Full access to all features and settings'}
                  {newMember.role === 'editor' && 'Full control over content, no system access'}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddMember(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="px-6 py-2.5 bg-[#1A2551] text-white rounded-lg hover:bg-[#1A2551]/90 transition-colors font-medium"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </CMSPageLayout>
  );
}