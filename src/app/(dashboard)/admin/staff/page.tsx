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
  X,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import FoodLoadingState from "@/components/FoodLoader";

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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex items-stretch gap-3 sm:gap-3.5">
          <div className="w-1 bg-[#35118F] rounded-full self-stretch shrink-0" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#6A6577] mb-0.5">
              User Administration
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A162B] tracking-tight leading-tight">
              Staff & Account Directory
            </h1>
            <p className="text-xs text-[#6A6577] mt-1">
              Manage institutional users, credentials, roles, and active statuses.
            </p>
          </div>
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
          className="btn-primary h-10 px-4 rounded-xl text-xs font-bold"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          <span>Add New Account</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-start space-x-2.5 text-xs shadow-xs ${
            feedback.type === "success"
              ? "bg-[#EEFBF6] text-[#0C7A5B]"
              : "bg-red-50 text-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-[#12B98A] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6A6577]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by Staff ID, Name, or Department..."
          className="form-input pl-10 rounded-xl"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <FoodLoadingState
          title="Loading staff directory..."
          subtitle="Fetching verified institutional accounts"
          showText
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9FD] border-b border-[#F1EFF7] text-[11px] font-bold uppercase tracking-wider text-[#6A6577]">
                <tr>
                  <th className="px-5 sm:px-6 py-3.5">Staff ID</th>
                  <th className="px-5 sm:px-6 py-3.5">Full Name</th>
                  <th className="px-5 sm:px-6 py-3.5">Department</th>
                  <th className="px-5 sm:px-6 py-3.5">Role</th>
                  <th className="px-5 sm:px-6 py-3.5">Status</th>
                  <th className="px-5 sm:px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFF7]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F8F7FC]/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-[#35118F]">
                      {u.staffId}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#24212D]">
                      {u.fullName}
                      {u.mustChangePassword && (
                        <span className="block text-[11px] text-[#946200] font-normal">
                          Requires password change
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[#6A6577]">{u.department || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={
                          u.role === "ADMIN"
                            ? "badge-purple"
                            : u.role === "CANTEEN"
                            ? "badge-warning"
                            : "badge-neutral"
                        }
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.isActive ? (
                        <span className="badge-success">
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="badge-danger">
                          <span>Deactivated</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setFullName(u.fullName);
                          setDepartment(u.department);
                          setRole(u.role);
                        }}
                        title="Edit Profile"
                        className="btn-icon"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setResettingUser(u);
                          setNewPassword("Temp@12345");
                        }}
                        title="Reset Password"
                        className="btn-icon text-[#35118F] hover:text-[#35118F] hover:bg-[#F4F0FD]"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setToggleActiveUser(u)}
                        title={u.isActive ? "Deactivate Account" : "Reactivate Account"}
                        className={`btn-icon ${
                          u.isActive
                            ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                            : "text-[#0C7A5B] hover:text-[#0C7A5B] hover:bg-[#EEFBF6]"
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
        <div className="fixed inset-0 z-50 bg-[#24212D]/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-5 border border-[#E5E2EE]">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E2EE]">
              <h3 className="text-base font-semibold text-[#24212D]">Create New Staff Account</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-icon"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              <div>
                <label className="form-label">
                  Staff ID
                </label>
                <input
                  type="text"
                  required
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  placeholder="e.g. 1117"
                  className="form-input uppercase font-mono"
                />
              </div>

              <div>
                <label className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Chandra"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Operations / Logistics"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="form-input"
                >
                  <option value="STAFF">STAFF (Meal Requests & QR)</option>
                  <option value="ADMIN">ADMIN (Full Management)</option>
                  <option value="CANTEEN">CANTEEN (QR Scanning & Counts)</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Initial Temporary Password
                </label>
                <input
                  type="text"
                  required
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  className="form-input font-mono"
                />
                <span className="form-helper">
                  Staff will be forced to change this password on first login.
                </span>
              </div>

              <div className="pt-3 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
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
        <div className="fixed inset-0 z-50 bg-[#24212D]/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-5 border border-[#E5E2EE]">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E2EE]">
              <h3 className="text-base font-semibold text-[#24212D]">
                Edit Staff: {editingUser.staffId}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="btn-icon"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-3.5">
              <div>
                <label className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="form-input"
                >
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="CANTEEN">CANTEEN</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
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
        <div className="fixed inset-0 z-50 bg-[#24212D]/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-5 border border-[#E5E2EE]">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E2EE]">
              <h3 className="text-base font-semibold text-[#24212D]">
                Reset Password: {resettingUser.staffId}
              </h3>
              <button
                onClick={() => setResettingUser(null)}
                className="btn-icon"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-3.5">
              <p className="text-xs text-[#6A6577] leading-relaxed">
                You can securely assign a new temporary password. For safety, the user will be required to change it on their next login.
              </p>

              <div>
                <label className="form-label">
                  New Temporary Password
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 digit"
                  className="form-input font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
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

