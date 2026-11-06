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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#24212D]/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-5 border border-[#E5E2EE]">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                variant === "danger"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : variant === "warning"
                  ? "bg-[#FEF9ED] text-[#946200] border border-[#F5B51B]/30"
                  : "bg-[#F4F0FD] text-[#35118F] border border-[#35118F]/20"
              }`}
            >
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-base font-semibold text-[#24212D]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#6A6577] hover:text-[#24212D] p-1.5 rounded-lg hover:bg-[#F6F5FA] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[#6A6577] mt-3 leading-relaxed">{description}</p>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="btn-secondary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={
              variant === "danger"
                ? "btn-destructive"
                : variant === "warning"
                ? "inline-flex items-center justify-center h-10 px-4 rounded-lg bg-[#F5B51B] hover:bg-[#d6990d] text-[#24212D] text-sm font-medium transition-colors shadow-xs disabled:opacity-50"
                : "btn-primary"
            }
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

