import { useState, useEffect } from 'react';
import { Users, Loader2, Plus, Pencil, Trash2, ShieldCheck, Shield } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { toast } from 'sonner';
import { CMSPageLayout } from '../CMSPageLayout';
import { supabase, supabaseUrl } from '../../../utils/supabase/client';
import { useAuth, UserRole } from '../../../contexts/AuthContext';


// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}



// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export function CMSSettings() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const { user: currentUser } = useAuth();

  // ----------------------------------------------------------------------
  // Load Data
  // ----------------------------------------------------------------------

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });

      if (data) {
        setProfiles(data as UserProfile[]);
      }
    } catch (error) {
      console.error('Failed to load settings', error);
      toast.error('Failed to load some settings');
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // Team Management Actions (via Edge Function)
  // ----------------------------------------------------------------------

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as string;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const response = await fetch(`${supabaseUrl}/functions/v1/cms-settings/create_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ email, password, role, fullName })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      toast.success('User created successfully');
      setIsAddModalOpen(false);
      loadSettings(); // Refresh list
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    }
  };

  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string; // Optional

    // Validation: Only admins can edit other admins' passwords
    if (selectedUser.role === 'administrator' && selectedUser.id !== currentUser?.id && password) {
      // This is technically allowed by the system if the current user is an admin,
      // but we might want to add a double-check or warning.
      // For now, we allow it as requested: "only administrators can edit passwords of other administrators"
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const payload: any = { id: selectedUser.id, fullName, role };
      if (password && password.trim() !== '') {
        payload.password = password;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/cms-settings/update_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      toast.success('User updated successfully');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      loadSettings();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const response = await fetch(`${supabaseUrl}/functions/v1/cms-settings/delete_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: userId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      loadSettings();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  // ----------------------------------------------------------------------
  // Notification Actions
  // ----------------------------------------------------------------------



  // ----------------------------------------------------------------------
  // Permissions Check
  // ----------------------------------------------------------------------

  if (currentUser?.role !== 'administrator') {
    return (
      <CMSPageLayout title="Access Denied" description="Restricted area">
        <div className="bg-red-50 p-12 rounded-2xl border border-red-100 flex flex-col items-center text-center max-w-2xl mx-auto mt-12">
          <Shield className="w-16 h-16 text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Restricted Access</h2>
          <p className="text-red-700">Only administrators have permission to access system settings and team management.</p>
        </div>
      </CMSPageLayout>
    );
  }

  return (
    <CMSPageLayout
      title="Settings"
      description="Manage team access and system preferences"
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1A2551]">Team Members</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage administrative access to the CMS.
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1A2551] hover:bg-[#1A2551]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-300" />
                  </td>
                </tr>
              ) : profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A2551]/10 to-[#1A2551]/5 flex items-center justify-center text-[#1A2551] font-bold text-xs">
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
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${profile.role === 'administrator'
                      ? 'bg-purple-50 text-purple-700 border-purple-100'
                      : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                      {profile.role === 'administrator' ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-500">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(profile);
                          setIsEditModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-[#1A2551]"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={profile.id === currentUser?.id}
                        onClick={() => handleDeleteUser(profile.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* ADD USER MODAL */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="w-[95vw] max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user with access to the CMS.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" required placeholder="e.g. John Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" required placeholder="john@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} placeholder="Min 6 characters" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="editor">
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="administrator">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-[#1A2551] text-white">Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT USER MODAL */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[95vw] max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details or reset their password.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleEditUser} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input id="edit-fullName" name="fullName" defaultValue={selectedUser.full_name || ''} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email (Read Only)</Label>
                <Input id="edit-email" value={selectedUser.email} disabled className="bg-gray-100" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select name="role" defaultValue={selectedUser.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 pt-2 border-t mt-2">
                <Label htmlFor="edit-password">New Password (Optional)</Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep unchanged"
                  minLength={6}
                />
                <p className="text-[10px] text-gray-500">Only fill this if you want to change the user's password.</p>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-[#1A2551] text-white">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </CMSPageLayout>
  );
}