
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, Upload, Move } from 'lucide-react';
import { toast } from 'sonner';
import { getAllTeamMembersAdmin, upsertTeamMember, deleteTeamMember, reorderTeamMembers } from '../../../utils/database';
import { ImageWithFallback } from '../../ui/ImageWithFallback';
import { CMSImageUpload } from '../CMSImageUpload';
import type { TeamMember } from '../../../types/database';

export function CMSTeam() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null);

    useEffect(() => {
        loadMembers();
    }, []);

    async function loadMembers() {
        setLoading(true);
        const data = await getAllTeamMembersAdmin();
        setMembers(data);
        setLoading(false);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!editingMember) return;

        // Determine default display_order if new
        let display_order = editingMember.display_order;
        if (display_order === undefined) {
            display_order = members.length > 0 ? Math.max(...members.map(m => m.display_order)) + 1 : 0;
        }

        const payload = {
            ...editingMember,
            display_order,
            status: editingMember.status || 'active'
        };

        const saved = await upsertTeamMember(payload);
        if (saved) {
            toast.success('Team member saved successfully');
            setEditingMember(null);
            loadMembers();
        } else {
            toast.error('Failed to save team member. Please check all required fields.');
        }
    }

    async function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this team member?')) {
            await deleteTeamMember(id);
            loadMembers();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-[#1A2551]">Team Members</h2>
                <button
                    onClick={() => setEditingMember({})}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1A2551] text-white rounded-lg hover:bg-[#1A2551]/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Member
                </button>
            </div>

            {editingMember ? (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-[#1A2551]">
                            {editingMember.id ? 'Edit Member' : 'New Member'}
                        </h3>
                        <button
                            onClick={() => setEditingMember(null)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editingMember.name || ''}
                                    onChange={e => setEditingMember({ ...editingMember, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editingMember.role || ''}
                                    onChange={e => setEditingMember({ ...editingMember, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                rows={3}
                                value={editingMember.bio || ''}
                                onChange={e => setEditingMember({ ...editingMember, bio: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editingMember.email || ''}
                                    onChange={e => setEditingMember({ ...editingMember, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={editingMember.phone || ''}
                                    onChange={e => setEditingMember({ ...editingMember, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20"
                                />
                            </div>
                        </div>

                        <div>
                            <CMSImageUpload
                                label="Profile Photo"
                                value={editingMember.image || ''}
                                onChange={(url) => setEditingMember({ ...editingMember, image: url })}
                                folder="team"
                                description="Recommended size: 800x1067px (3:4 aspect ratio)"
                                variant="compact"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                            <input
                                type="text"
                                value={editingMember.linkedin_url || ''}
                                onChange={e => setEditingMember({ ...editingMember, linkedin_url: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2551]/20"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setEditingMember(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 bg-[#1A2551] text-white rounded-lg hover:bg-[#1A2551]/90 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                Save Member
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {members.length === 0 && !loading ? (
                        <div className="p-8 text-center text-gray-500">
                            No team members found. Add one to get started.
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {members.map((member) => (
                                    <tr key={member.id} className="group hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full overflow-hidden">
                                                    {member.image ? (
                                                        <img src={member.image} alt={member.name} className="h-10 w-10 object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ marginLeft: '30px' }}>
                                                    <div className="text-sm font-medium text-[#1A2551]">{member.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {member.role}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{member.email}</div>
                                            <div>{member.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingMember(member)}
                                                    className="p-1 text-gray-400 hover:text-[#1A2551] transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(member.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
