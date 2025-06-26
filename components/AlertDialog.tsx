import React from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal';
import { useTheme } from '../contexts/ThemeContext';
import { staggerContainerVariants, staggerItemVariants, shakeVariants, getAnimationConfig } from '../utils/animations';

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
  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size='sm'>
      <motion.div
        variants={getAnimationConfig(staggerContainerVariants)}
        initial="hidden"
        animate="visible"
      >
        <motion.p 
          className={`${theme.card.secondaryText} mb-4 sm:mb-6 text-sm sm:text-base`}
          variants={getAnimationConfig(staggerItemVariants)}
        >
          {message}
        </motion.p>
        <motion.div 
          className='flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3'
          variants={getAnimationConfig(staggerItemVariants)}
        >
          <motion.button
            onClick={onClose}
            className={`w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 ${theme.button.secondary} ${theme.button.secondaryText} ${theme.card.rounded} transition text-sm sm:text-base`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.2 }}
          >
            {cancelText}
          </motion.button>
          <motion.button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`w-full sm:w-auto px-4 py-2 ${theme.button.danger} ${theme.button.dangerText} rounded-full transition text-sm sm:text-base`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            variants={getAnimationConfig(shakeVariants)}
            onAnimationComplete={(definition) => {
              // Add a subtle shake animation when hovered for destructive actions
              if (definition === 'shake') {
                // Animation completed
              }
            }}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.2 }}
          >
            {confirmText}
          </motion.button>
        </motion.div>
      </motion.div>
    </Modal>
  );
};

export default AlertDialog;
