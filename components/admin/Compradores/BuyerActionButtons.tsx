"use client";

import { useState, useTransition } from "react";
import {
  NoSymbolIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

// Un botón individual genérico que maneja su propio estado de loading y éxito
function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant,
  title,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => Promise<void>;
  variant: "suspend" | "activate" | "re-onboard" | "clear" | "reset";
  title: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = () => {
    startTransition(async () => {
      try {
        await onClick();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } catch (error) {
        console.error("Action failed:", error);
      }
    });
  };

  const baseClasses =
    "relative flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all duration-200 text-[10px] font-bold shadow-sm h-16 w-full text-center overflow-hidden";
  
  const variants = {
    suspend: "bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-600",
    activate: "bg-[#485696] border-[#485696] hover:brightness-110 text-white",
    "re-onboard": "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700",
    clear: "bg-gray-50 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-500",
    reset: "bg-red-50 border-red-200 hover:bg-red-100 text-red-700",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || showSuccess || disabled}
      title={title}
      className={`${baseClasses} ${disabled ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60" : variants[variant]} ${
        isPending ? "opacity-70 cursor-wait" : ""
      }`}
    >
      {isPending ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : showSuccess ? (
        <CheckIcon className="h-5 w-5 text-emerald-500 animate-in zoom-in duration-300" />
      ) : (
        <Icon className="h-5 w-5" />
      )}
      <span className="leading-tight wrap-break-words w-full px-1">
        {showSuccess ? "¡Listo!" : label}
      </span>
    </button>
  );
}

export default function BuyerActionButtons({
  buyerId,
  isActive,
  onToggleStatus,
  onResetOnboarding,
  onClearOrders,
  onHardReset,
  isAdmin,
}: {
  buyerId: string;
  isActive: boolean;
  onToggleStatus: (formData: FormData) => Promise<void>;
  onResetOnboarding: (formData: FormData) => Promise<void>;
  onClearOrders: (formData: FormData) => Promise<void>;
  onHardReset: (formData: FormData) => Promise<void>;
  isAdmin?: boolean;
}) {
  // Helpers para convertir las llamadas en Promises simples para el botón
  const handleToggle = async () => {
    const fd = new FormData();
    fd.append("buyerId", buyerId);
    fd.append("currentStatus", String(isActive));
    await onToggleStatus(fd);
  };

  const handleResetOnboarding = async () => {
    const fd = new FormData();
    fd.append("buyerId", buyerId);
    await onResetOnboarding(fd);
  };

  const handleClearOrders = async () => {
    const fd = new FormData();
    fd.append("buyerId", buyerId);
    await onClearOrders(fd);
  };

  const handleHardReset = async () => {
    const fd = new FormData();
    fd.append("buyerId", buyerId);
    await onHardReset(fd);
  };

  return (
    <div className="grid grid-cols-2 gap-2 min-w-[160px]">
      <ActionButton
        icon={isActive ? NoSymbolIcon : ShieldCheckIcon}
        label={isActive ? "Suspender" : "Activar"}
        variant={isActive ? "suspend" : "activate"}
        title={isAdmin ? "No se puede suspender a un administrador" : (isActive ? "Suspender acceso del usuario" : "Restaurar acceso del usuario")}
        onClick={handleToggle}
        disabled={isAdmin}
      />
      <ActionButton
        icon={ArrowPathIcon}
        label="Resetear datos"
        variant="re-onboard"
        title="Forzar al usuario a reingresar sus datos logísticos"
        onClick={handleResetOnboarding}
      />
      <ActionButton
        icon={TrashIcon}
        label="Resetear órdenes"
        variant="clear"
        title="Borrar historial de órdenes y compras"
        onClick={handleClearOrders}
      />
      <ActionButton
        icon={ArrowUturnLeftIcon}
        label="Resetear todo"
        variant="reset"
        title="Eliminar carritos, compras y limpiar dirección"
        onClick={handleHardReset}
      />
    </div>
  );
}
