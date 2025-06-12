
import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { searchImagesByTag } from '../services/api';
import type { ImageRead, ApiError } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import ImageCard from './ImageCard';
import ImageDetailModal from './ImageDetailModal';
import ImageCardSkeleton from './ImageCardSkeleton';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { PhotoIcon } from './icons';

const ITEMS_PER_PAGE = 20;
const SESSION_STORAGE_SCROLL_PREFIX = 'tagPageScrollPos_';
const SESSION_STORAGE_COUNT_PREFIX = 'tagPageItemCount_';

const TagPage: React.FC = () => {
  const { tagName: encodedTagName } = useParams<{ tagName: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  const [allImages, setAllImages] = useState<ImageRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | string | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<ImageRead | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [isImageDetailModalOpen, setIsImageDetailModalOpen] = useState(false);

  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [initialSessionStateRestored, setInitialSessionStateRestored] = useState(false);
  
  const decodedTagName = useMemo(() => {
    try {
      return encodedTagName ? decodeURIComponent(encodedTagName) : '';
    } catch (e) {
      console.error("Failed to decode tagName:", encodedTagName, e);
      return encodedTagName || ''; // Fallback to encoded if decoding fails
    }
  }, [encodedTagName]);

  const scrollPositionKey = useMemo(() => `${SESSION_STORAGE_SCROLL_PREFIX}${decodedTagName}`, [decodedTagName]);
  const itemCountKey = useMemo(() => `${SESSION_STORAGE_COUNT_PREFIX}${decodedTagName}`, [decodedTagName]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCount = sessionStorage.getItem(itemCountKey);
      if (storedCount) {
        setDisplayCount(Math.max(ITEMS_PER_PAGE, parseInt(storedCount, 10)));
      }
    }
  }, [itemCountKey]);

  const fetchImagesByTag = useCallback(async () => {
    if (!decodedTagName) {
        setError({ message: "Tag name is missing."});
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchImagesByTag(decodedTagName);
      setAllImages(data);
    } catch (err) {
      setError(err as ApiError);
      setAllImages([]);
    } finally {
      setIsLoading(false);
    }
  }, [decodedTagName]);

  useEffect(() => {
    fetchImagesByTag();
  }, [fetchImagesByTag]);

  useLayoutEffect(() => {
    if (!isLoading && allImages.length > 0 && !initialSessionStateRestored && typeof window !== 'undefined') {
        const savedScroll = sessionStorage.getItem(scrollPositionKey);
        if (savedScroll) {
            requestAnimationFrame(() => window.scrollTo(0, parseInt(savedScroll, 10)));
        }
        setInitialSessionStateRestored(true);
    }
  }, [isLoading, allImages, initialSessionStateRestored, scrollPositionKey]);

  useEffect(() => {
    const saveState = () => {
      if (typeof window !== 'undefined' && initialSessionStateRestored) {
        sessionStorage.setItem(scrollPositionKey, String(window.scrollY));
        sessionStorage.setItem(itemCountKey, String(displayCount));
      }
    };
    
    // Save on unmount
    return () => {
      saveState();
    };
  }, [displayCount, scrollPositionKey, itemCountKey, initialSessionStateRestored]);


  const displayedImages = useMemo(() => {
    return allImages.slice(0, displayCount);
  }, [allImages, displayCount]);

  const handleLoadMore = () => {
    const newCount = Math.min(displayCount + ITEMS_PER_PAGE, allImages.length);
    setDisplayCount(newCount);
  };

  const openImageModal = (image: ImageRead, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setIsImageDetailModalOpen(true);
  };

  const handlePreviousImage = () => {
    if (displayedImages && currentImageIndex !== null && currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setSelectedImage(displayedImages[newIndex]);
      setCurrentImageIndex(newIndex);
    }
  };

  const handleNextImage = () => {
    if (displayedImages && currentImageIndex !== null && currentImageIndex < displayedImages.length - 1) {
      const newIndex = currentImageIndex + 1;
      setSelectedImage(displayedImages[newIndex]);
      setCurrentImageIndex(newIndex);
    }
  };
  
  const handleImageUpdateInModal = (updatedImage: ImageRead) => {
    setAllImages(prevImages => prevImages.map(img => img.id === updatedImage.id ? updatedImage : img));
    if (selectedImage && selectedImage.id === updatedImage.id) {
        setSelectedImage(updatedImage);
    }
  };

  const handleImageDeleteInModal = (deletedImageId: string) => {
    setAllImages(prevImages => prevImages.filter(img => img.id !== deletedImageId));
    if (selectedImage && selectedImage.id === deletedImageId) {
        setIsImageDetailModalOpen(false);
        setSelectedImage(null);
        setCurrentImageIndex(null);
    }
  };


  const breakpointColumnsObj = {
    default: 5,
    1536: 5, // 2xl
    1280: 4, // xl
    1024: 3, // lg
    768: 3,  // md
    640: 2   // sm
  };

  const renderContent = () => {
    if (isLoading && allImages.length === 0) {
      return (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {Array.from({ length: ITEMS_PER_PAGE / 2 }).map((_, index) => (
            <ImageCardSkeleton key={index} />
          ))}
        </Masonry>
      );
    }

    if (error) {
      return <ErrorDisplay error={error} onRetry={fetchImagesByTag} />;
    }

    if (allImages.length === 0) {
      return (
        <div className={`text-center py-10 ${theme.card.secondaryText} animate-fadeIn`}>
          <PhotoIcon className={`w-16 h-16 mx-auto mb-4 opacity-50 ${theme.card.secondaryText}`} />
          <p className="text-lg sm:text-xl">No images found for tag: "{decodedTagName}"</p>
        </div>
      );
    }

    return (
      <>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {displayedImages.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1], delay: (index % ITEMS_PER_PAGE) * 0.03 }}
            >
              <ImageCard image={image} onClick={() => openImageModal(image, index)} forceSquare={false} />
            </motion.div>
          ))}
        </Masonry>
        {displayCount < allImages.length && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              className={`px-6 py-3 ${theme.button.primary} ${theme.button.primaryText} ${theme.card.rounded} ${theme.button.transition} text-sm font-semibold hover:opacity-90 active:scale-95`}
            >
              Load More ({allImages.length - displayCount} remaining)
            </button>
          </div>
        )}
      </>
    );
  };
  
  const titleTextClass = theme.name === 'Neon Galaxy' || theme.name === 'RetroTech Dark' 
    ? theme.brandColor 
    : theme.text;


  return (
    <div className="space-y-6 sm:space-y-8">
      <div className={`p-4 sm:p-5 ${theme.card.bg} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border || ''} animate-fadeInUp`}>
        <h1 className={`text-2xl sm:text-3xl font-bold ${titleTextClass} mb-1`}>
          Tag: {decodedTagName}
        </h1>
        <p className={`${theme.card.secondaryText} text-sm sm:text-base`}>
          {isLoading ? 'Loading images...' : `${allImages.length} image${allImages.length !== 1 ? 's' : ''} found.`}
        </p>
      </div>

      {renderContent()}

      {selectedImage && isImageDetailModalOpen && (
        <ImageDetailModal
          image={selectedImage}
          isOpen={isImageDetailModalOpen}
          onClose={() => setIsImageDetailModalOpen(false)}
          onUpdate={handleImageUpdateInModal}
          onDelete={handleImageDeleteInModal}
          onThumbnailUpdated={fetchImagesByTag} // Or a more targeted update if possible
          isCurrentlyCategoryThumbnail={false} // Tag pages don't directly manage category thumbnails
          allowSetCategoryThumbnail={false} // Cannot set category thumbnail from tag page
          onPreviousImage={handlePreviousImage}
          onNextImage={handleNextImage}
          hasPreviousImage={currentImageIndex !== null && currentImageIndex > 0}
          hasNextImage={currentImageIndex !== null && currentImageIndex < displayedImages.length - 1}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
};

export default TagPage;
