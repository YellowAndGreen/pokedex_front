import React, { useEffect, useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { XMarkIcon } from './icons';
import { modalVariants, backdropVariants, getAnimationConfig } from '../utils/animations';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { theme } = useTheme();

  // Use React.useId for generating unique IDs for ARIA attributes
  const titleId = `modal-title-${useId()}`;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl md:max-w-4xl lg:max-w-5xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with enhanced animation */}
          <motion.div
            className="fixed inset-0 z-30 bg-black backdrop-blur-sm"
            onClick={onClose}
            aria-hidden='true'
            variants={getAnimationConfig(backdropVariants)}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Modal Dialog Positioning Wrapper: z-index 50 (above header) */}
          <div className="fixed inset-0 flex justify-center items-center z-50 p-2 sm:p-4">
            {/* Actual Modal Content Box with enhanced animation */}
            <motion.div
              className={`${theme.modal.bg} ${theme.modal.rounded} ${theme.modal.shadow} 
                         w-full ${sizeClasses[size]} p-4 sm:p-6`}
              onClick={e => e.stopPropagation()} // Prevent clicks on content from closing modal
              role='dialog'
              aria-modal='true'
              aria-labelledby={titleId}
              variants={getAnimationConfig(modalVariants)}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div 
                className='flex justify-between items-center mb-3 sm:mb-4'
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                <motion.h2
                  id={titleId}
                  className={`text-lg sm:text-xl font-semibold ${theme.modal.titleText}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.2 }}
                >
                  {title}
                </motion.h2>
                <motion.button
                  onClick={onClose}
                  className={`${theme.iconButton} ${theme.button.transition} p-1 rounded-full hover:bg-opacity-20 focus:outline-none focus:ring-2 ${theme.input.focusRing.replace('focus:ring-2', '').trim()}`}
                  aria-label='Close modal'
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                >
                  <XMarkIcon className='w-5 h-5 sm:w-6 sm:h-6' />
                </motion.button>
              </motion.div>
              <motion.div 
                className='overflow-y-auto max-h-[80vh] sm:max-h-[75vh] md:max-h-[70vh] pr-1 scrollbar-thin'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {children}
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
