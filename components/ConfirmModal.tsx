"use client";

import { useEffect } from "react";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => !isLoading && onCancel()}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all m-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 sm:h-12 sm:w-12">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold leading-6 text-gray-900 mt-1 sm:mt-2">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-full p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600 leading-relaxed pl-1 sm:pl-16">
            {message}
          </p>
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <button
            type="button"
            disabled={isLoading}
            className="inline-flex w-full sm:w-auto justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            className="inline-flex w-full sm:w-auto justify-center rounded-xl border border-transparent bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 focus:outline-none transition-colors disabled:opacity-50"
            onClick={onConfirm}
          >
            {isLoading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
