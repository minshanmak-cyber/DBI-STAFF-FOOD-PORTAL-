"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  isLoading = false,
  onConfirm,
  onClose,
  children,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const confirmBtnColors = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
    warning: "bg-[#F5B51B] hover:bg-[#d6990d] text-white focus:ring-[#F5B51B]",
    primary: "bg-[#35118F] hover:bg-[#2a0d72] text-white focus:ring-[#35118F]",
  }[variant];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#24212D]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-[#E5E2EE]">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-full ${
                variant === "danger"
                  ? "bg-rose-100 text-rose-600"
                  : variant === "warning"
                  ? "bg-[#FEF9ED] text-[#F5B51B]"
                  : "bg-[#F4F0FD] text-[#35118F]"
              }`}
            >
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#24212D]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#6A6577] hover:text-[#24212D] p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[#6A6577] mt-3">{description}</p>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#6A6577] bg-white border border-[#E5E2EE] rounded-xl hover:bg-[#F6F5FA] transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-xs transition ${confirmBtnColors} disabled:opacity-50`}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

