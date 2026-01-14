import { useState, useEffect } from 'react';
import { Users, Loader2, Plus, Pencil, Trash2, ShieldCheck, Shield, Mail, X } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
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

  // Notification Settings
  const [notificationEmails, setNotificationEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isSavingEmails, setIsSavingEmails] = useState(false);

  // Delete User Confirmation
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      // Load profiles
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });

      if (data) {
        setProfiles(data as UserProfile[]);
      }

      // Load notification email settings
      const { data: emailSettings } = await supabase
        .from('global_settings')
        .select('setting_value')
        .eq('setting_key', 'enquiry_notification_emails')
        .single();

      if (emailSettings?.setting_value) {
        setNotificationEmails(emailSettings.setting_value as string[]);
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
  // Notification Email Actions
  // ----------------------------------------------------------------------

  const saveNotificationEmails = async (emails: string[]) => {
    setIsSavingEmails(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const response = await fetch(`${supabaseUrl}/functions/v1/cms-settings/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          key: 'enquiry_notification_emails',
          value: emails
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      setNotificationEmails(emails);
      toast.success('Notification recipients updated');
    } catch (error: any) {
      console.error('Error saving notification emails:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSavingEmails(false);
    }
  };

  const handleAddNotificationEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (notificationEmails.includes(email)) {
      toast.error('This email is already in the list');
      return;
    }

    const updatedEmails = [...notificationEmails, email];
    saveNotificationEmails(updatedEmails);
    setNewEmail('');
  };

  const handleRemoveNotificationEmail = (emailToRemove: string) => {
    const updatedEmails = notificationEmails.filter(e => e !== emailToRemove);
    saveNotificationEmails(updatedEmails);
  };



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
                        onClick={() => {
                          setUserToDelete(profile.id);
                          setIsDeleteDialogOpen(true);
                        }}
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

      {/* NOTIFICATION SETTINGS */}
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div>
          <h2 className="text-xl font-semibold text-[#1A2551]">Enquiry Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage who receives email notifications when new enquiries are submitted.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-[#1A2551]">Email Recipients</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Add email addresses to receive notifications for new enquiries from the website.
              </p>
            </div>
          </div>

          {/* Add email input */}
          <div className="flex gap-2 mb-4">
            <Input
              type="email"
              placeholder="Enter email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNotificationEmail();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={handleAddNotificationEmail}
              disabled={isSavingEmails || !newEmail.trim()}
              className="bg-[#1A2551] hover:bg-[#1A2551]/90"
            >
              {isSavingEmails ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span className="ml-2">Add</span>
            </Button>
          </div>

          {/* Email list */}
          {notificationEmails.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notification recipients configured.</p>
              <p className="text-xs text-gray-400 mt-1">Add an email address above to start receiving enquiry notifications.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notificationEmails.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                      {email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700">{email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveNotificationEmail(email)}
                    disabled={isSavingEmails}
                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {notificationEmails.length > 0 && (
            <p className="text-xs text-gray-400 mt-4">
              {notificationEmails.length} recipient{notificationEmails.length !== 1 ? 's' : ''} will be notified when new enquiries are submitted.
            </p>
          )}
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

      {/* DELETE USER CONFIRMATION */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and remove their access to the CMS.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSPageLayout>
  );
}