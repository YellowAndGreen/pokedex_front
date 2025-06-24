import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { IMAGE_BASE_URL } from '../constants'; // Changed from API_BASE_URL to IMAGE_BASE_URL
import { useTheme } from '../contexts/ThemeContext';
import { deleteImage as deleteImageApiCall, updateImageMetadata } from '../services/api'; // Renamed imported deleteImage
import type { ApiError, ExifData, ImageRead, ImageUpdate, TagRead } from '../types';
import AlertDialog from './AlertDialog';
import ErrorDisplay from './ErrorDisplay';
import {
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
  ImagePlaceholderIcon,
  StarIcon,
  TrashIcon,
  XMarkIcon,
} from './icons'; // Added ImagePlaceholderIcon
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';

interface ImageDetailModalProps {
  image: ImageRead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedImage: ImageRead) => void;
  onDelete: (imageId: string, categoryId: string) => void;
  onThumbnailUpdated: () => void;
  isCurrentlyCategoryThumbnail?: boolean;
  onPreviousImage: () => void;
  onNextImage: () => void;
  hasPreviousImage: boolean;
  hasNextImage: boolean;
  allowSetCategoryThumbnail?: boolean;
  isAuthenticated: boolean; // Added isAuthenticated prop
}

type ToastState = {
  message: string;
  type: 'success' | 'error';
} | null;

const getRelativeUrl = (absoluteUrl: string | null | undefined): string | null | undefined => {
  if (absoluteUrl && absoluteUrl.startsWith(IMAGE_BASE_URL)) {
    // Changed from API_BASE_URL
    return absoluteUrl.substring(IMAGE_BASE_URL.length); // Changed from API_BASE_URL
  }
  return absoluteUrl;
};

const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  image,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onThumbnailUpdated,
  isCurrentlyCategoryThumbnail = false,
  onPreviousImage,
  onNextImage,
  hasPreviousImage,
  hasNextImage,
  allowSetCategoryThumbnail = true,
  isAuthenticated, // Destructure isAuthenticated
}) => {
  const { theme, isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsStringForInput, setTagsStringForInput] = useState('');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [toastState, setToastState] = useState<ToastState>(null);

  const [currentDisplaySrc, setCurrentDisplaySrc] = useState<string | null>(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [isFullImageLoading, setIsFullImageLoading] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isImageMaximized, setIsImageMaximized] = useState(false);

  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const maximizedViewRef = useRef<HTMLDivElement>(null);

  const inputBaseClasses = `block w-full px-3 py-2 text-sm ${theme.input.bg} ${theme.input.border} ${theme.card.rounded} shadow-sm ${theme.input.focusRing} ${theme.input.text} ${theme.input.placeholderText}`;

  const themedButtonClasses = (
    type: 'primary' | 'secondary' | 'danger',
    _size: 'sm' | 'base' = 'base'
  ) => {
    const roundedClass = type === 'danger' ? 'rounded-full' : theme.card.rounded;
    const base = `px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm ${roundedClass} font-medium transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`;
    if (type === 'primary') {
      return `${base} ${theme.button.primary} ${theme.button.primaryText}`;
    }
    if (type === 'secondary') {
      return `${base} ${theme.button.secondary} ${theme.button.secondaryText}`;
    }
    if (type === 'danger') {
      return `${base} ${theme.button.danger} ${theme.button.dangerText}`;
    }
    return base;
  };

  const resetForm = useCallback(() => {
    if (image) {
      setTitle(image.title || '');
      setDescription(image.description || '');
      if (image.tags && image.tags.length > 0) {
        setTagsStringForInput(image.tags.map(t => t.name).join(', '));
      } else {
        setTagsStringForInput('');
      }
    }
  }, [image]);

  useEffect(() => {
    let toastTimer: ReturnType<typeof setTimeout>;
    if (toastState) {
      toastTimer = setTimeout(() => {
        setToastState(null);
      }, 3000);
    }
    return () => clearTimeout(toastTimer);
  }, [toastState]);

  useEffect(() => {
    if (isOpen && image) {
      resetForm();
      setIsEditing(false);
      setError(null);
      setIsImageMaximized(false);
      setImageScale(1);
      setImagePosition({ x: 0, y: 0 });
      setImageLoadFailed(false);
      setImageKey(prev => prev + 1);

      const transformedThumbnailUrl = getRelativeUrl(image.thumbnail_url);
      const transformedImageUrl = getRelativeUrl(image.image_url);

      const preferredSrcForModal = transformedThumbnailUrl || transformedImageUrl;
      setCurrentDisplaySrc(preferredSrcForModal || null);

      if (transformedImageUrl && transformedImageUrl !== preferredSrcForModal) {
        setIsFullImageLoading(true);
        const fullResImage = new window.Image();
        fullResImage.onload = () => {
          if (isOpen && image && image.id === image.id) {
            setCurrentDisplaySrc(transformedImageUrl!);
            setImageLoadFailed(false);
            setImageKey(prev => prev + 1);
            setIsFullImageLoading(false);
          }
        };
        fullResImage.onerror = () => {
          if (isOpen && image && image.id === image.id) {
            if (!preferredSrcForModal) {
              setImageLoadFailed(true);
            }
            setIsFullImageLoading(false);
          }
        };
        fullResImage.src = transformedImageUrl;
      } else {
        if (!preferredSrcForModal) {
          setImageLoadFailed(true);
        }
        setIsFullImageLoading(false);
      }
    } else if (!isOpen) {
      setCurrentDisplaySrc(null);
      setIsFullImageLoading(false);
      setImageLoadFailed(false);
      setImageKey(0);
      setToastState(null);
      setIsImageMaximized(false);
      setImageScale(1);
      setImagePosition({ x: 0, y: 0 });
    }
  }, [isOpen, image, resetForm]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditing && !isImageMaximized) {
        return;
      }
      if (isDeleteDialogOpen) {
        return;
      }

      if (event.key === 'Escape') {
        if (isImageMaximized) {
          event.preventDefault();
          setIsImageMaximized(false);
        } else if (isEditing) {
          // Editing form, let form cancel or modal close handle
        } else {
          // Modal default behavior (onClose) will trigger
        }
      } else if (isImageMaximized || (!isImageMaximized && !isEditing)) {
        if (event.key === 'ArrowLeft' && hasPreviousImage) {
          event.preventDefault();
          onPreviousImage();
          setImageScale(1);
          setImagePosition({ x: 0, y: 0 });
        } else if (event.key === 'ArrowRight' && hasNextImage) {
          event.preventDefault();
          onNextImage();
          setImageScale(1);
          setImagePosition({ x: 0, y: 0 });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isOpen,
    isEditing,
    isImageMaximized,
    isDeleteDialogOpen,
    hasPreviousImage,
    hasNextImage,
    onPreviousImage,
    onNextImage,
    onClose,
  ]);

  const handleUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!image) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updatedData: ImageUpdate = {
        title: title || null,
        description: description || null,
        tags: tagsStringForInput.trim() ? tagsStringForInput.trim() : null,
      };
      const updatedImage = await updateImageMetadata(image.id, updatedData);
      onUpdate(updatedImage);
      setIsEditing(false);
      setToastState({ message: 'Details updated successfully!', type: 'success' });
    } catch (err) {
      setError(err as ApiError);
      setToastState({ message: 'Failed to update details.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetAsCategoryThumbnail = async () => {
    if (!image || isCurrentlyCategoryThumbnail || !allowSetCategoryThumbnail) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await updateImageMetadata(image.id, { set_as_category_thumbnail: true });
      setToastState({ message: 'Set as category thumbnail!', type: 'success' });
      onThumbnailUpdated();
    } catch (err) {
      setError(err as ApiError);
      setToastState({ message: 'Failed to set as thumbnail.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!image) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await deleteImageApiCall(image.id);
      onDelete(image.id, image.category_id);
      onClose();
    } catch (err) {
      setError(err as ApiError);
      setToastState({ message: 'Failed to delete image.', type: 'error' });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isImageMaximized && isEditing) {
      return;
    }
    if (isImageMaximized && imageScale > 1) {
    } else if (isDeleteDialogOpen) {
      return;
    } else {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isImageMaximized && isEditing) {
      return;
    }
    if (isImageMaximized && imageScale > 1) {
      setTouchStartX(null);
      return;
    }
    if (isDeleteDialogOpen || touchStartX === null) {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const swipeThreshold = 50;

    if (deltaX > swipeThreshold && hasPreviousImage) {
      onPreviousImage();
      setImageScale(1);
      setImagePosition({ x: 0, y: 0 });
    } else if (deltaX < -swipeThreshold && hasNextImage) {
      onNextImage();
      setImageScale(1);
      setImagePosition({ x: 0, y: 0 });
    }
    setTouchStartX(null);
  };

  const handleWheelZoom = (event: React.WheelEvent) => {
    if (!isImageMaximized || !maximizedViewRef.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const rect = maximizedViewRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const zoomIntensity = 0.1;
    const direction = event.deltaY < 0 ? 1 : -1;

    const oldScale = imageScale;
    const newScale = Math.max(0.5, Math.min(oldScale * (1 + direction * zoomIntensity), 5));

    const originX = mouseX - (rect.width / 2 + imagePosition.x);
    const originY = mouseY - (rect.height / 2 + imagePosition.y);

    const newPosX = imagePosition.x - originX * (newScale / oldScale - 1);
    const newPosY = imagePosition.y - originY * (newScale / oldScale - 1);

    setImageScale(newScale);
    setImagePosition({ x: newPosX, y: newPosY });
  };

  const handleMaximizedImageDrag = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (!isImageMaximized) {
      return;
    }
    setImagePosition(prev => ({
      x: prev.x + info.delta.x,
      y: prev.y + info.delta.y,
    }));
  };

  if (!isOpen || !image) {
    return null;
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) {
      return 'N/A';
    }
    return new Date(dateString).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatBytes = (bytes?: number | null, decimals = 2) => {
    if (bytes === null || bytes === undefined) {
      return 'N/A';
    }
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const renderExifData = (exif?: ExifData | null) => {
    if (!exif) {
      return (
        <p className={`text-xs sm:text-sm ${theme.card.secondaryText}`}>No EXIF data available.</p>
      );
    }
    const entries = Object.entries(exif).filter(
      ([, value]) => value !== null && value !== undefined && value !== ''
    );
    if (entries.length === 0) {
      return (
        <p className={`text-xs sm:text-sm ${theme.card.secondaryText}`}>No EXIF data available.</p>
      );
    }

    let exifBgClass = '';
    switch (theme.name) {
      case 'Modern Clean Pro':
        exifBgClass = 'bg-slate-50 dark:bg-slate-700/70';
        break;
      case 'Nature Inspired':
        exifBgClass = 'bg-lime-50 dark:bg-green-800/60';
        break;
      case 'Neon Galaxy':
        exifBgClass = 'bg-indigo-800/40 dark:bg-gray-800/50';
        break;
      case 'Arcade Flash':
        exifBgClass = 'bg-zinc-100 dark:bg-zinc-700/80';
        break;
      case 'RetroTech Dark':
        exifBgClass = 'bg-slate-700/60'; // This theme is always dark
        break;
      default:
        exifBgClass = 'bg-gray-100 dark:bg-neutral-700';
    }

    return (
      <div
        className={`mt-1 space-y-1 text-xs ${theme.card.secondaryText} ${exifBgClass} p-2 sm:p-3 ${theme.card.rounded} max-h-48 sm:max-h-60 overflow-y-auto scrollbar-thin`}
      >
        {entries.map(([key, value]) => (
          <div key={key} className='grid grid-cols-2 gap-1 sm:gap-2'>
            <strong className={`font-medium capitalize truncate ${theme.card.text}`}>
              {key.replace(/_/g, ' ')}:
            </strong>
            <span className='truncate'>{String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const hasExifData =
    image.exif_info &&
    Object.values(image.exif_info).some(val => val !== null && val !== undefined && val !== '');

  const navButtonBaseClass = `absolute top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-150 focus:outline-none ring-1 ring-transparent focus-visible:ring-2 ${theme.input.focusRing.replace('focus:ring-2', '').trim()} opacity-70 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed`;
  const expandButtonBaseClass = `absolute top-2 right-2 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-150 focus:outline-none ring-1 ring-transparent focus-visible:ring-2 ${theme.input.focusRing.replace('focus:ring-2', '').trim()} opacity-70 hover:opacity-100`;

  const renderImageOrPlaceholder = (maximized = false) => {
    // currentDisplaySrc already holds the potentially relative URL
    const srcToUse = maximized
      ? getRelativeUrl(image?.image_url) || currentDisplaySrc
      : currentDisplaySrc;
    const isActuallyLoading =
      isFullImageLoading &&
      (!maximized || (maximized && srcToUse === getRelativeUrl(image?.image_url)));

    if (srcToUse && !imageLoadFailed) {
      return (
        <>
          <motion.img
            key={maximized ? `maximized-${imageKey}` : `modal-${imageKey}`}
            src={srcToUse}
            alt={image?.title || (maximized ? 'Maximized Image' : 'Image')}
            drag={maximized && isImageMaximized}
            onDrag={maximized ? handleMaximizedImageDrag : undefined}
            dragConstraints={maximized ? maximizedViewRef : undefined}
            initial={{ scale: maximized ? 0.8 : 1, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: maximized ? imagePosition.x : 0,
              y: maximized ? imagePosition.y : 0,
            }}
            exit={{ scale: maximized ? 0.8 : 1, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={
              maximized
                ? {
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    cursor: 'grab',
                    scale: imageScale,
                    userSelect: 'none',
                    touchAction: 'none',
                    transformOrigin: 'center center',
                  }
                : {
                    objectFit: 'contain',
                    cursor: 'pointer',
                  }
            }
            className={
              maximized
                ? 'shadow-2xl'
                : `w-full h-auto max-h-[50vh] md:max-h-[70vh] ${theme.card.rounded} shadow-md`
            }
            onClick={e => {
              if (maximized) {
                e.stopPropagation();
              } else {
                setIsImageMaximized(true);
              }
            }}
            onDoubleClick={
              maximized
                ? () => {
                    setImageScale(1);
                    setImagePosition({ x: 0, y: 0 });
                  }
                : undefined
            }
            onError={() => setImageLoadFailed(true)}
          />
          {isActuallyLoading && (
            <div
              className={`absolute inset-0 flex justify-center items-center ${maximized ? 'bg-black/30' : `${theme.card.bg} bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm ${theme.card.rounded}`} z-10 pointer-events-none`}
            >
              <LoadingSpinner size={maximized ? 'lg' : 'md'} />
            </div>
          )}
        </>
      );
    }
    // Render placeholder if srcToUse is null or imageLoadFailed is true
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${maximized ? 'bg-transparent' : `${theme.skeletonBase} ${theme.skeletonHighlight} ${theme.card.rounded}`} ${!maximized ? 'max-h-[50vh] md:max-h-[70vh]' : ''}`}
      >
        <ImagePlaceholderIcon
          className={`w-16 h-16 sm:w-20 sm:h-20 opacity-50 ${theme.card.secondaryText}`}
        />
      </div>
    );
  };

  const renderMaximizedImageView = () => (
    <AnimatePresence>
      {isImageMaximized && (
        <motion.div
          ref={maximizedViewRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className='fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-0 overflow-hidden'
          onClick={() => {
            if (imageScale === 1 && imagePosition.x === 0 && imagePosition.y === 0) {
              setIsImageMaximized(false);
            }
          }}
          onWheel={handleWheelZoom}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {renderImageOrPlaceholder(true)}
          <button
            onClick={e => {
              e.stopPropagation();
              setIsImageMaximized(false);
            }}
            className='absolute top-4 right-4 z-30 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-opacity'
            aria-label='Close maximized view'
          >
            <XMarkIcon className='w-6 h-6 sm:w-7 sm:h-7' />
          </button>
          {hasPreviousImage && (
            <button
              onClick={e => {
                e.stopPropagation();
                onPreviousImage();
                setImageScale(1);
                setImagePosition({ x: 0, y: 0 });
              }}
              className={`${navButtonBaseClass} left-4 sm:left-6`}
              aria-label='Previous image'
            >
              <ChevronLeftIcon className='w-7 h-7 sm:w-8 sm:h-8' />
            </button>
          )}
          {hasNextImage && (
            <button
              onClick={e => {
                e.stopPropagation();
                onNextImage();
                setImageScale(1);
                setImagePosition({ x: 0, y: 0 });
              }}
              className={`${navButtonBaseClass} right-4 sm:right-6`}
              aria-label='Next image'
            >
              <ChevronRightIcon className='w-7 h-7 sm:w-8 sm:h-8' />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Modal
        isOpen={isOpen && !isImageMaximized}
        onClose={onClose}
        title={isEditing ? 'Edit Image Details' : image.title || 'Image Details'}
        size='2xl'
      >
        <div className='md:flex md:space-x-4 lg:space-x-6'>
          <div
            className='relative w-full md:w-1/2 mb-4 md:mb-0 group/imagecontainer'
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode='wait'>{renderImageOrPlaceholder(false)}</AnimatePresence>
            <button
              onClick={e => {
                e.stopPropagation();
                setIsImageMaximized(true);
              }}
              className={`${expandButtonBaseClass} opacity-0 group-hover/imagecontainer:opacity-70 hover:!opacity-100`}
              aria-label='View image fullscreen'
              title='View image fullscreen'
            >
              <ArrowsPointingOutIcon className='w-5 h-5' />
            </button>
            {hasPreviousImage && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onPreviousImage();
                  setImageScale(1);
                  setImagePosition({ x: 0, y: 0 });
                }}
                className={`${navButtonBaseClass} left-1 sm:left-2`}
                aria-label='Previous image'
                disabled={!hasPreviousImage || isEditing || isDeleteDialogOpen}
              >
                <ChevronLeftIcon className='w-5 h-5 sm:w-6 sm:h-6' />
              </button>
            )}
            {hasNextImage && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onNextImage();
                  setImageScale(1);
                  setImagePosition({ x: 0, y: 0 });
                }}
                className={`${navButtonBaseClass} right-1 sm:right-2`}
                aria-label='Next image'
                disabled={!hasNextImage || isEditing || isDeleteDialogOpen}
              >
                <ChevronRightIcon className='w-5 h-5 sm:w-6 sm:h-6' />
              </button>
            )}
          </div>
          <div className='w-full md:w-1/2 space-y-3 sm:space-y-4'>
            {error && !isEditing && <ErrorDisplay error={error} />}
            {isEditing && isAuthenticated ? ( // Show form only if editing and authenticated
              <form onSubmit={handleUpdate} className='space-y-3 sm:space-y-4'>
                {error && <ErrorDisplay error={error} />}
                <div>
                  <label
                    htmlFor='editImageTitle'
                    className={`block text-xs sm:text-sm font-medium ${theme.card.text}`}
                  >
                    Title
                  </label>
                  <input
                    type='text'
                    id='editImageTitle'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    maxLength={255}
                    className={`mt-1 ${inputBaseClasses} text-xs sm:text-sm`}
                  />
                </div>
                <div>
                  <label
                    htmlFor='editImageDescription'
                    className={`block text-xs sm:text-sm font-medium ${theme.card.text}`}
                  >
                    Description
                  </label>
                  <textarea
                    id='editImageDescription'
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className={`mt-1 ${inputBaseClasses} text-xs sm:text-sm`}
                  />
                </div>
                <div>
                  <label
                    htmlFor='editImageTags'
                    className={`block text-xs sm:text-sm font-medium ${theme.card.text}`}
                  >
                    Tags (comma-separated)
                  </label>
                  <input
                    type='text'
                    id='editImageTags'
                    value={tagsStringForInput}
                    onChange={e => setTagsStringForInput(e.target.value)}
                    className={`mt-1 ${inputBaseClasses} text-xs sm:text-sm`}
                  />
                </div>
                <div className='flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-1'>
                  <button
                    type='button'
                    onClick={() => {
                      setIsEditing(false);
                      resetForm();
                      setError(null);
                    }}
                    disabled={isLoading}
                    className={`w-full sm:w-auto mb-2 sm:mb-0 ${themedButtonClasses('secondary')}`}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isLoading}
                    className={`w-full sm:w-auto ${themedButtonClasses('primary')}`}
                  >
                    {isLoading ? <LoadingSpinner size='sm' /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              // View mode or not authenticated and editing (should not happen, but defensive)
              <>
                <h3 className={`text-xl sm:text-2xl font-semibold ${theme.modal.titleText}`}>
                  {image.title || 'Untitled Image'}
                </h3>
                <p
                  className={`${theme.card.secondaryText} whitespace-pre-wrap break-words text-xs sm:text-sm`}
                >
                  {image.description || 'No description.'}
                </p>

                {image.tags && image.tags.length > 0 && (
                  <div className='mt-2'>
                    <span className={`font-semibold text-xs sm:text-sm ${theme.card.text}`}>
                      Tags:{' '}
                    </span>
                    {image.tags.map((tag: TagRead) => {
                      const tagBgClass =
                        theme.name === 'Pokedex Playful'
                          ? 'bg-yellow-200 dark:bg-yellow-700'
                          : theme.name === 'Nature Inspired'
                            ? 'bg-lime-200 dark:bg-green-700'
                            : theme.name === 'Neon Galaxy'
                              ? 'bg-cyan-500/20 dark:bg-cyan-400/20'
                              : theme.name === 'Arcade Flash'
                                ? 'bg-blue-200 dark:bg-blue-700'
                                : 'bg-blue-100 dark:bg-blue-800'; // Default for Modern Clean Pro & RetroTech Dark

                      let tagTextColorClass = 'text-gray-700 dark:text-gray-200'; // Default fallback
                      if (theme.name === 'Pokedex Playful') {
                        tagTextColorClass = 'text-yellow-800 dark:text-yellow-100';
                      } else if (theme.name === 'Nature Inspired') {
                        tagTextColorClass = 'text-green-800 dark:text-lime-100';
                      } else if (theme.name === 'Neon Galaxy') {
                        tagTextColorClass = 'text-cyan-200 dark:text-cyan-100';
                      } // Adjusted for better contrast on subtle bg
                      else if (theme.name === 'Arcade Flash') {
                        tagTextColorClass = 'text-blue-800 dark:text-blue-100';
                      } else if (
                        theme.name === 'Modern Clean Pro' ||
                        theme.name === 'RetroTech Dark'
                      ) {
                        // Defaulting tagBgClass to blueish
                        tagTextColorClass = 'text-blue-700 dark:text-blue-200';
                        if (
                          theme.name === 'RetroTech Dark' &&
                          tagBgClass === 'bg-blue-100 dark:bg-blue-800'
                        ) {
                          // Special case if default bg is used in Retro
                          tagTextColorClass = 'text-emerald-700 dark:text-emerald-200'; // Use RetroTech's brand hue if possible
                        }
                      }

                      return (
                        <Link
                          key={tag.id}
                          to={`/tags/${encodeURIComponent(tag.name)}`}
                          onClick={onClose} // Close modal on tag click
                          className={`inline-block ${tagBgClass} ${tagTextColorClass} text-xs font-medium mr-1.5 mb-1 px-2 py-0.5 rounded-full hover:no-underline hover:opacity-85 focus:outline-none focus:ring-1 ${theme.input.focusRing.replace('focus:ring-2', 'focus:ring-')} transition-opacity duration-150`}
                          aria-label={`View images tagged with ${tag.name}`}
                        >
                          {tag.name}
                        </Link>
                      );
                    })}
                  </div>
                )}

                <div
                  className={`text-xs sm:text-sm ${theme.card.secondaryText} space-y-1 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t ${isDarkMode ? 'border-gray-700/70' : 'border-gray-200'}`}
                >
                  <p>
                    <strong>Uploaded:</strong> {formatDate(image.created_at)}
                  </p>
                  <p>
                    <strong>Last Updated:</strong> {formatDate(image.updated_at)}
                  </p>
                  <p>
                    <strong>Original Filename:</strong>{' '}
                    <span className='break-all'>{image.original_filename || 'N/A'}</span>
                  </p>
                  <p>
                    <strong>MIME Type:</strong> {image.mime_type || 'N/A'}
                  </p>
                  <p>
                    <strong>Size:</strong> {formatBytes(image.size_bytes)}
                  </p>
                </div>

                {hasExifData && (
                  <div
                    className={`mt-2 sm:mt-3 pt-2 sm:pt-3 border-t ${isDarkMode ? 'border-gray-700/70' : 'border-gray-200'}`}
                  >
                    <h4 className={`text-xs sm:text-sm font-medium ${theme.card.text} mb-1`}>
                      EXIF Data
                    </h4>
                    {renderExifData(image.exif_info)}
                  </div>
                )}

                {isAuthenticated && (
                  <div className='mt-4 sm:mt-6 flex flex-wrap gap-2'>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setError(null);
                      }}
                      disabled={isLoading}
                      className={themedButtonClasses('secondary')}
                    >
                      <EditIcon className='mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4' /> Edit
                    </button>
                    {allowSetCategoryThumbnail && (
                      <button
                        onClick={handleSetAsCategoryThumbnail}
                        disabled={isLoading || isCurrentlyCategoryThumbnail}
                        className={themedButtonClasses('secondary')}
                        title={
                          isCurrentlyCategoryThumbnail
                            ? 'This is already the category thumbnail'
                            : 'Set as category thumbnail'
                        }
                      >
                        <StarIcon
                          filled={isCurrentlyCategoryThumbnail}
                          className='mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4'
                        />{' '}
                        Set as Thumbnail
                      </button>
                    )}
                    <button
                      onClick={() => setIsDeleteDialogOpen(true)}
                      disabled={isLoading}
                      className={themedButtonClasses('danger')}
                    >
                      <TrashIcon className='mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4' /> Delete
                    </button>
                  </div>
                )}
                {isLoading && !isEditing && (
                  <div className='mt-2'>
                    <LoadingSpinner size='sm' />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {isAuthenticated && (
          <AlertDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDeleteConfirmed}
            title='Delete Image'
            message={`Are you sure you want to delete the image "${image.title || image.original_filename || 'this image'}"? This action cannot be undone.`}
            confirmText='Delete'
          />
        )}
        <AnimatePresence>
          {toastState && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
              className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] p-3 px-5 ${theme.card.rounded} shadow-2xl text-sm font-medium
                ${
                  toastState.type === 'success'
                    ? `${theme.button.primary} ${theme.button.primaryText}`
                    : `${theme.button.danger} ${theme.button.dangerText}`
                }`}
              role='alert'
            >
              {toastState.message}
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
      {renderMaximizedImageView()}
    </>
  );
};

export default ImageDetailModal;
