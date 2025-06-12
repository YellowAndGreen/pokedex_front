
import React from 'react';
import Modal from './Modal';
import { useTheme } from '../contexts/ThemeContext';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  const { theme } = useTheme();
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className={`${theme.card.secondaryText} mb-4 sm:mb-6 text-sm sm:text-base`}>{message}</p>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
        <button
          onClick={onClose}
          className={`w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 ${theme.button.secondary} ${theme.button.secondaryText} ${theme.card.rounded} transition text-sm sm:text-base`}
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`w-full sm:w-auto px-4 py-2 ${theme.button.danger} ${theme.button.dangerText} rounded-full transition text-sm sm:text-base`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default AlertDialog;