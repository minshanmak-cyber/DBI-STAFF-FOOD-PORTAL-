"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  KeyRound,
  Edit2,
  UserX,
  UserCheck,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

interface StaffUser {
  id: string;
  staffId: string;
  role: "ADMIN" | "STAFF" | "CANTEEN";
  isActive: boolean;
  mustChangePassword: boolean;
  fullName: string;
  department: string;
  createdAt: string;
}

export default function StaffManagementPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [resettingUser, setResettingUser] = useState<StaffUser | null>(null);
  const [toggleActiveUser, setToggleActiveUser] = useState<StaffUser | null>(null);

  // Form states
  const [staffId, setStaffId] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<"STAFF" | "ADMIN" | "CANTEEN">("STAFF");
  const [initialPassword, setInitialPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: staffId.trim(),
          fullName: fullName.trim(),
          department: department.trim() || null,
          role,
          initialPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to create staff member." });
      } else {
        setFeedback({ type: "success", message: data.message });
        setShowCreateModal(false);
        // Reset form
        setStaffId("");
        setFullName("");
        setDepartment("");
        setInitialPassword("");
        fetchUsers();
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Network error creating user." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/staff/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          department: department.trim() || null,
          role,
          isActive: editingUser.isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to update profile." });
      } else {
        setFeedback({ type: "success", message: data.message });
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Network error updating user." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/staff/${resettingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to reset password." });
      } else {
        setFeedback({ type: "success", message: data.message });
        setResettingUser(null);
        setNewPassword("");
        fetchUsers();
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Network error resetting password." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!toggleActiveUser) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/staff/${toggleActiveUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: toggleActiveUser.fullName,
          department: toggleActiveUser.department,
          role: toggleActiveUser.role,
          isActive: !toggleActiveUser.isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to change user status." });
      } else {
        setFeedback({ type: "success", message: data.message });
        setToggleActiveUser(null);
        fetchUsers();
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Network error changing user status." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.staffId.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff & Account Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage institutional users, credentials, roles, and active statuses.
          </p>
        </div>

        <button
          onClick={() => {
            setStaffId("");
            setFullName("");
            setDepartment("");
            setInitialPassword("Staff@12345");
            setRole("STAFF");
            setShowCreateModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <UserPlus className="w-4 h-4 text-sky-400" />
          <span>Add New Account</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-start space-x-3 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by Staff ID, Name, or Department..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 mr-3" />
          <span>Loading staff accounts...</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-6 py-4">Staff ID</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {u.staffId}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {u.fullName}
                      {u.mustChangePassword && (
                        <span className="block text-[10px] text-amber-600 font-normal">
                          Requires password change
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.department}</td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          <span>Deactivated</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setFullName(u.fullName);
                          setDepartment(u.department);
                          setRole(u.role);
                        }}
                        title="Edit Profile"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setResettingUser(u);
                          setNewPassword("Temp@12345");
                        }}
                        title="Reset Password"
                        className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-md transition"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setToggleActiveUser(u)}
                        title={u.isActive ? "Deactivate Account" : "Reactivate Account"}
                        className={`p-1.5 rounded-md transition ${
                          u.isActive
                            ? "text-rose-600 hover:bg-rose-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {u.isActive ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Staff Account</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Staff ID
                </label>
                <input
                  type="text"
                  required
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  placeholder="e.g. 1117"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Chandra"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Operations / Logistics"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="STAFF">STAFF (Meal Requests & QR)</option>
                  <option value="ADMIN">ADMIN (Full Management)</option>
                  <option value="CANTEEN">CANTEEN (QR Scanning & Counts)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Initial Temporary Password
                </label>
                <input
                  type="text"
                  required
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Staff will be forced to change this password on first login.
                </span>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Edit Staff: {editingUser.staffId}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="CANTEEN">CANTEEN</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Reset Password: {resettingUser.staffId}
              </h3>
              <button
                onClick={() => setResettingUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
              <p className="text-xs text-slate-500">
                You can securely assign a new temporary password. For safety, the user will be required to change it on their next login.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  New Temporary Password
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 digit"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-sky-700 text-white text-xs font-semibold rounded-lg hover:bg-sky-800 disabled:opacity-50"
                >
                  {submitting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate / Reactivate Modal */}
      <ConfirmModal
        isOpen={Boolean(toggleActiveUser)}
        title={
          toggleActiveUser?.isActive ? "Deactivate Staff Account?" : "Reactivate Staff Account?"
        }
        description={
          toggleActiveUser?.isActive
            ? `Are you sure you want to deactivate ${toggleActiveUser.staffId} (${toggleActiveUser.fullName})? They will be blocked from logging in, requesting meals, or collecting food.`
            : `Reactivate account for ${toggleActiveUser?.staffId} (${toggleActiveUser?.fullName})?`
        }
        variant={toggleActiveUser?.isActive ? "danger" : "primary"}
        confirmLabel={toggleActiveUser?.isActive ? "Deactivate" : "Reactivate"}
        isLoading={submitting}
        onConfirm={handleToggleActive}
        onClose={() => setToggleActiveUser(null)}
      />
    </div>
  );
}

