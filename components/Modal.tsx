
import React, { useEffect, useState, useId } from 'react';
import { XMarkIcon } from './icons';
import { useTheme } from '../contexts/ThemeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false); 
  const [isVisible, setIsVisible] = useState(false); 

  // Use React.useId for generating unique IDs for ARIA attributes
  const titleId = useId ? `modal-title-${useId()}` : `modal-title-${Math.random().toString(36).substring(2, 9)}`;


  useEffect(() => {
    let openTimer: ReturnType<typeof setTimeout>;
    let closeTimer: ReturnType<typeof setTimeout>;

    if (isOpen) {
      setIsMounted(true);
      openTimer = setTimeout(() => {
        setIsVisible(true);
      }, 10); 
    } else {
      setIsVisible(false);
      closeTimer = setTimeout(() => {
        setIsMounted(false);
      }, 300); 
    }

    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = ''; 
    };
  }, [isVisible]);

  if (!isMounted) {
    return null;
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl md:max-w-4xl lg:max-w-5xl',
  };

  return (
    <>
      {/* Backdrop: z-index 30 (below header which is z-40) */}
      <div
        className={`fixed inset-0 z-30 
                    transition-opacity duration-300 ease-in-out 
                    bg-black ${isVisible ? 'bg-opacity-60 dark:bg-opacity-75 backdrop-blur-sm' : 'bg-opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Positioning Wrapper: z-index 50 (above header) */}
      <div
        className={`fixed inset-0 flex justify-center items-center z-50 
                    p-2 sm:p-4 
                    ${isVisible ? '' : 'pointer-events-none'} 
                    pointer-events-none`} 
      >
        {/* Actual Modal Content Box */}
        <div
          className={`${theme.modal.bg} ${theme.modal.rounded} ${theme.modal.shadow} 
                     w-full ${sizeClasses[size]} p-4 sm:p-6 
                     transform transition-all duration-300 modal-transition 
                     ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
                     pointer-events-auto`} // Make content interactive
          onClick={(e) => e.stopPropagation()} // Prevent clicks on content from closing modal
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 id={titleId} className={`text-lg sm:text-xl font-semibold ${theme.modal.titleText}`}>{title}</h2>
            <button
              onClick={onClose}
              className={`${theme.iconButton} ${theme.button.transition} p-1 rounded-full hover:bg-opacity-20 focus:outline-none focus:ring-2 ${theme.input.focusRing.replace('focus:ring-2', '').trim()}`}
              aria-label="Close modal"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[80vh] sm:max-h-[75vh] md:max-h-[70vh] pr-1 scrollbar-thin">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
