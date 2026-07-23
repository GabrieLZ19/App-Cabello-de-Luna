'use client';

import React from 'react';
import {
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  XCircle as XCircleIcon,
  X as XIcon,
} from 'lucide-react';

const AlertTriangle: any = AlertTriangleIcon;
const CheckCircle: any = CheckCircleIcon;
const Info: any = InfoIcon;
const XCircle: any = XCircleIcon;
const X: any = XIcon;

export type AlertType = 'success' | 'danger' | 'info' | 'warning';

interface CustomAlertProps {
  isOpen: boolean;
  type?: AlertType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onClose: () => void;
  showCancel?: boolean;
}

export default function CustomAlert({
  isOpen,
  type = 'info',
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onClose,
  showCancel = true,
}: CustomAlertProps) {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'danger':
        return <XCircle className="w-8 h-8 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-amber-400" />;
      case 'info':
      default:
        return <Info className="w-8 h-8 text-[#C9A45C]" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/30';
      case 'danger':
        return 'border-red-500/30';
      case 'warning':
        return 'border-amber-500/30';
      case 'info':
      default:
        return 'border-[#C9A45C]/40';
    }
  };

  const getConfirmBtnStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white font-bold';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 text-black font-bold';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-black font-bold';
      case 'info':
      default:
        return 'bg-[#C9A45C] hover:bg-[#b5924d] text-black font-bold';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className={`bg-[#15100A] border ${getBorderColor()} rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-200`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-4 pt-1">
          <div className="p-3 bg-black/50 rounded-2xl border border-white/10 shrink-0">
            {renderIcon()}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-[#B0A894] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
          {showCancel && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-black/30 border border-white/10 hover:border-white/20 transition-all"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg ${getConfirmBtnStyle()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
