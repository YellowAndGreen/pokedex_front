import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../constants'; // Changed from API_BASE_URL to IMAGE_BASE_URL
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { useTheme } from '../contexts/ThemeContext';
import {
  deleteCategory,
  getCategoryWithImages,
  updateCategory,
  uploadImage,
} from '../services/api';
import type {
  ApiError,
  BodyUploadImage,
  CategoryReadWithImages,
  CategoryUpdate,
  ImageRead,
} from '../types';
import AlertDialog from './AlertDialog';
import CategoryForm from './CategoryForm';
import ErrorDisplay from './ErrorDisplay';
import { EditIcon, ImagePlaceholderIcon, TrashIcon, UploadIcon } from './icons'; // Added ImagePlaceholderIcon
import ImageCard from './ImageCard';
import ImageCardSkeleton from './ImageCardSkeleton';
import ImageDetailModal from './ImageDetailModal';
import ImageUploadForm from './ImageUploadForm';
import LoadingSpinner from './LoadingSpinner';
import Modal from './Modal';

const getRelativeUrl = (absoluteUrl: string | null | undefined): string | null | undefined => {
  if (absoluteUrl && absoluteUrl.startsWith(IMAGE_BASE_URL)) {
    // Changed from API_BASE_URL
    return absoluteUrl.substring(IMAGE_BASE_URL.length); // Changed from API_BASE_URL
  }
  return absoluteUrl;
};

const CategoryDetail: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth(); // Get authentication state

  const [category, setCategory] = useState<CategoryReadWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | string | null>(null);

  const [selectedImage, setSelectedImage] = useState<ImageRead | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [isImageDetailModalOpen, setIsImageDetailModalOpen] = useState(false);

  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isUploadImageModalOpen, setIsUploadImageModalOpen] = useState(false);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);

  const [formError, setFormError] = useState<ApiError | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialImageOpened, setInitialImageOpened] = useState(false);
  const [categoryThumbnailLoadError, setCategoryThumbnailLoadError] = useState(false);

  const fetchCategoryDetails = useCallback(
    async (openImageId?: string | null) => {
      if (!categoryId) {
        return;
      }
      setIsLoading(true);
      setError(null);
      setInitialImageOpened(false);
      setCategoryThumbnailLoadError(false);
      try {
        const data = await getCategoryWithImages(categoryId);
        setCategory(data);
        if (openImageId && data.images) {
          const imageToOpenIndex = data.images.findIndex(img => img.id === openImageId);
          if (imageToOpenIndex !== -1) {
            setTimeout(() => {
              openImageModal(data.images![imageToOpenIndex], imageToOpenIndex);
              setInitialImageOpened(true);
            }, 0);
          }
        }
      } catch (err) {
        setError(err as ApiError);
        setCategory(null);
      } finally {
        setIsLoading(false);
      }
    },
    [categoryId]
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const imageIdToOpen = queryParams.get('imageId');
    fetchCategoryDetails(imageIdToOpen);
  }, [fetchCategoryDetails, location.search]);

  useEffect(() => {
    // Reset thumbnail error when category changes
    if (category) {
      setCategoryThumbnailLoadError(false);
    }
  }, [category?.id, category?.thumbnail_url]);

  useEffect(() => {
    if (
      !isLoading &&
      category &&
      category.images &&
      !isImageDetailModalOpen &&
      !initialImageOpened
    ) {
      const queryParams = new URLSearchParams(location.search);
      const imageIdToOpen = queryParams.get('imageId');
      if (imageIdToOpen) {
        const imageToOpenIndex = category.images.findIndex(img => img.id === imageIdToOpen);
        if (imageToOpenIndex !== -1) {
          openImageModal(category.images[imageToOpenIndex], imageToOpenIndex);
          setInitialImageOpened(true);
        }
      }
    }
  }, [isLoading, category, location.search, isImageDetailModalOpen, initialImageOpened, navigate]);

  const handleUpdateCategory = async (data: CategoryUpdate) => {
    if (!categoryId) {
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const updatedCategory = await updateCategory(categoryId, data);
      setCategory(prev => (prev ? { ...prev, ...updatedCategory } : updatedCategory));
      setIsEditCategoryModalOpen(false);
      setCategoryThumbnailLoadError(false); // Reset error if category data (potentially thumbnail_url) changes
    } catch (err) {
      setFormError(err as ApiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryId) {
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await deleteCategory(categoryId);
      navigate('/');
    } catch (err) {
      setFormError(err as ApiError);
      setIsDeleteCategoryDialogOpen(false);
      setError(err as ApiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadImage = async (data: BodyUploadImage) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await uploadImage(data);
      setIsUploadImageModalOpen(false);
      fetchCategoryDetails();
    } catch (err) {
      setFormError(err as ApiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpdate = (updatedImage: ImageRead) => {
    setCategory(prev => {
      if (!prev || !prev.images) {
        return prev;
      }
      const newImages = prev.images.map(img => (img.id === updatedImage.id ? updatedImage : img));
      if (selectedImage && selectedImage.id === updatedImage.id) {
        setSelectedImage(updatedImage);
      }
      return { ...prev, images: newImages };
    });
  };

  const handleImageDelete = (deletedImageId: string) => {
    setCategory(prev => {
      if (!prev || !prev.images) {
        return prev;
      }
      const wasThumbnail =
        (prev.thumbnail_url &&
          (prev.thumbnail_url.includes(deletedImageId) ||
            prev.thumbnail_url.includes(encodeURIComponent(deletedImageId)))) ||
        (prev.thumbnail_path && prev.thumbnail_path.includes(deletedImageId));

      const newImages = prev.images.filter(img => img.id !== deletedImageId);

      if (wasThumbnail) {
        fetchCategoryDetails();
        return { ...prev, images: newImages };
      }
      return { ...prev, images: newImages };
    });
    if (selectedImage && selectedImage.id === deletedImageId) {
      setIsImageDetailModalOpen(false);
      setSelectedImage(null);
      setCurrentImageIndex(null);
    }
  };

  const openImageModal = (image: ImageRead, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setIsImageDetailModalOpen(true);
  };

  const handlePreviousImage = () => {
    if (category?.images && currentImageIndex !== null && currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setSelectedImage(category.images[newIndex]);
      setCurrentImageIndex(newIndex);
    }
  };

  const handleNextImage = () => {
    if (
      category?.images &&
      currentImageIndex !== null &&
      category.images.length > 0 &&
      currentImageIndex < category.images.length - 1
    ) {
      const newIndex = currentImageIndex + 1;
      setSelectedImage(category.images[newIndex]);
      setCurrentImageIndex(newIndex);
    }
  };

  const thumbnailImageDetails = useMemo(() => {
    if (!category || !category.images || category.images.length === 0) {
      return null;
    }
    const { thumbnail_url, thumbnail_path, images } = category;
    if (!thumbnail_url && !thumbnail_path) {
      return null;
    }

    const relativeThumbnailUrl = getRelativeUrl(thumbnail_url);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const relativeImgUrl = getRelativeUrl(img.image_url);
      const relativeImgThumbnailUrl = getRelativeUrl(img.thumbnail_url);

      if (
        relativeThumbnailUrl &&
        (relativeImgUrl === relativeThumbnailUrl ||
          relativeImgThumbnailUrl === relativeThumbnailUrl)
      ) {
        return { image: img, index: i };
      }
      // Check path based comparison if URL match fails or thumbnail_url is not set
      if (
        thumbnail_path &&
        ((img.relative_file_path && img.relative_file_path === thumbnail_path) ||
          (img.relative_thumbnail_path && img.relative_thumbnail_path === thumbnail_path))
      ) {
        return { image: img, index: i };
      }
    }
    return null;
  }, [category]);

  const uploadButtonClass = `${theme.button.primary} ${theme.button.primaryText}`;

  if (isLoading && !category) {
    return (
      <div className='flex justify-center items-center h-96'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }
  if (error && !category) {
    return <ErrorDisplay error={error} onRetry={() => fetchCategoryDetails()} />;
  }
  if (!category && !isLoading) {
    return <p className={`text-center ${theme.card.secondaryText} py-10`}>Category not found.</p>;
  }

  const categoryThumbnailToDisplay = getRelativeUrl(category?.thumbnail_url);

  const isSelectedImageCategoryThumbnail = !!(
    category &&
    selectedImage &&
    ((getRelativeUrl(category.thumbnail_url) &&
      (getRelativeUrl(category.thumbnail_url) === getRelativeUrl(selectedImage.image_url) ||
        getRelativeUrl(category.thumbnail_url) === getRelativeUrl(selectedImage.thumbnail_url))) ||
      (category.thumbnail_path &&
        ((selectedImage.relative_file_path &&
          category.thumbnail_path === selectedImage.relative_file_path) ||
          (selectedImage.relative_thumbnail_path &&
            category.thumbnail_path === selectedImage.relative_thumbnail_path))))
  );

  const baseImageContainerClasses = `w-full h-auto max-h-[300px] md:max-h-[400px] ${theme.card.rounded} shadow-md overflow-hidden`;
  let dynamicImageContainerClasses = '';

  if (thumbnailImageDetails) {
    dynamicImageContainerClasses =
      'transition-all duration-300 ease-out group-hover:scale-103 group-hover:-translate-y-1 group-hover:shadow-xl';
  } else {
    dynamicImageContainerClasses = 'transition-transform duration-300 ease-in-out';
  }
  const imageContainerClassName = `${baseImageContainerClasses} ${dynamicImageContainerClasses}`;

  return (
    <div className='space-y-6 sm:space-y-8'>
      {error && (
        <div className='mb-4'>
          <ErrorDisplay error={error} onRetry={() => fetchCategoryDetails()} />
        </div>
      )}

      <div
        className={`p-4 sm:p-6 ${theme.card.bg} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border || ''} animate-fadeInUp`}
        style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
      >
        {isLoading && !category ? (
          <div className='animate-pulse'>
            <div
              className={`w-full md:w-1/3 h-48 md:h-64 ${theme.skeletonBase} ${theme.card.rounded} mb-4`}
            ></div>
            <div
              className={`w-1/2 h-8 sm:h-10 ${theme.skeletonBase} ${theme.card.rounded} mb-4`}
            ></div>
            <div
              className={`w-full h-5 sm:h-6 ${theme.skeletonBase} ${theme.card.rounded} mb-2`}
            ></div>
            <div className={`w-3/4 h-5 sm:h-6 ${theme.skeletonBase} ${theme.card.rounded}`}></div>
          </div>
        ) : (
          category && (
            <div className='md:flex md:items-start md:space-x-6'>
              <div
                className={`relative w-full md:w-1/3 mb-4 md:mb-0 group ${thumbnailImageDetails ? 'cursor-pointer' : ''} ${imageContainerClassName}`}
                onClick={() => {
                  if (thumbnailImageDetails) {
                    openImageModal(thumbnailImageDetails.image, thumbnailImageDetails.index);
                  }
                }}
                onKeyDown={e => {
                  if (thumbnailImageDetails && (e.key === 'Enter' || e.key === ' ')) {
                    openImageModal(thumbnailImageDetails.image, thumbnailImageDetails.index);
                  }
                }}
                role={thumbnailImageDetails ? 'button' : undefined}
                tabIndex={thumbnailImageDetails ? 0 : undefined}
                aria-label={
                  thumbnailImageDetails
                    ? `View thumbnail image: ${thumbnailImageDetails.image.title || category.name}`
                    : category.name
                }
              >
                {categoryThumbnailToDisplay && !categoryThumbnailLoadError ? (
                  <img
                    src={categoryThumbnailToDisplay}
                    alt={category.name}
                    className='w-full h-full object-cover' // Ensure image fills the container
                    onError={() => setCategoryThumbnailLoadError(true)}
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${theme.skeletonBase} ${categoryThumbnailToDisplay && categoryThumbnailLoadError ? theme.skeletonHighlight : ''}`}
                  >
                    <ImagePlaceholderIcon
                      className={`w-16 h-16 sm:w-20 sm:h-20 opacity-50 ${theme.card.secondaryText}`}
                    />
                  </div>
                )}
                {thumbnailImageDetails &&
                  categoryThumbnailToDisplay &&
                  !categoryThumbnailLoadError && (
                    <div
                      className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center ${theme.card.rounded}`}
                    ></div>
                  )}
              </div>
              <div className='md:w-2/3'>
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4'>
                  <div className='mb-2 sm:mb-0'>
                    <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${theme.text}`}>
                      {category.name}
                    </h1>
                    <p className={`${theme.card.secondaryText} text-xs sm:text-sm mt-1`}>
                      Created: {new Date(category.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {isAuthenticated && (
                    <div className='flex space-x-2 self-start sm:self-center'>
                      <button
                        onClick={() => {
                          setIsEditCategoryModalOpen(true);
                          setFormError(null);
                        }}
                        className={`p-1.5 sm:p-2 ${theme.iconButton} ${theme.button.transition} rounded-full hover:bg-opacity-20`}
                        title='Edit Category'
                      >
                        <EditIcon className='w-5 h-5 sm:w-6 sm:h-6' />
                      </button>
                      <button
                        onClick={() => setIsDeleteCategoryDialogOpen(true)}
                        className={`p-1.5 sm:p-2 ${theme.iconButton.replace('hover:text-', 'hover:text-red-')} ${theme.button.transition} rounded-full hover:bg-opacity-20`}
                        title='Delete Category'
                      >
                        <TrashIcon className='w-5 h-5 sm:w-6 sm:h-6' />
                      </button>
                    </div>
                  )}
                </div>
                <p className={`${theme.card.text} whitespace-pre-wrap text-sm sm:text-base`}>
                  {category.description || 'No description provided for this category.'}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      <div
        className='animate-fadeInUp'
        style={{ animationDelay: '0.25s', animationFillMode: 'backwards' }}
      >
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 sm:mt-8 mb-4 sm:mb-6 gap-3'>
          <h2 className={`text-xl sm:text-2xl font-semibold ${theme.text}`}>
            Images in this Category (
            {isLoading && !category?.images ? '...' : category?.images?.length || 0})
          </h2>
          {isAuthenticated && (
            <button
              onClick={() => {
                setIsUploadImageModalOpen(true);
                setFormError(null);
              }}
              className={`flex items-center justify-center w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 ${uploadButtonClass} ${theme.card.rounded} ${theme.button.transition} disabled:opacity-50 text-sm sm:text-base`}
              disabled={!category}
            >
              <UploadIcon className='w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2' />
              Upload Image
            </button>
          )}
        </div>

        {isLoading && (!category || !category.images || category.images.length === 0) ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4'>
            {Array.from({ length: 10 }).map((_, index) => (
              <ImageCardSkeleton key={index} />
            ))}
          </div>
        ) : category?.images && category.images.length > 0 ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4'>
            {category.images.map((img, index) => (
              <div
                key={img.id}
                className='animate-fadeInUp'
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                <ImageCard image={img} onClick={() => openImageModal(img, index)} />
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <p
              className={`text-center ${theme.card.secondaryText} py-10 animate-fadeIn text-sm sm:text-base`}
            >
              No images found in this category.{' '}
              {isAuthenticated ? 'Upload some!' : 'Login to upload images.'}
            </p>
          )
        )}
      </div>

      {selectedImage && (
        <ImageDetailModal
          image={selectedImage}
          isOpen={isImageDetailModalOpen}
          onClose={() => setIsImageDetailModalOpen(false)}
          onUpdate={handleImageUpdate}
          onDelete={handleImageDelete}
          onThumbnailUpdated={() => fetchCategoryDetails()}
          isCurrentlyCategoryThumbnail={isSelectedImageCategoryThumbnail}
          onPreviousImage={handlePreviousImage}
          onNextImage={handleNextImage}
          hasPreviousImage={currentImageIndex !== null && currentImageIndex > 0}
          hasNextImage={Boolean(
            category?.images &&
              currentImageIndex !== null &&
              currentImageIndex < category.images.length - 1
          )}
          isAuthenticated={isAuthenticated} // Pass isAuthenticated
        />
      )}

      {isAuthenticated && category && isEditCategoryModalOpen && (
        <Modal
          isOpen={isEditCategoryModalOpen}
          onClose={() => setIsEditCategoryModalOpen(false)}
          title='Edit Category'
        >
          <CategoryForm
            initialData={category}
            onSubmit={handleUpdateCategory}
            onCancel={() => setIsEditCategoryModalOpen(false)}
            isLoading={isSubmitting}
            error={formError}
          />
        </Modal>
      )}

      {isAuthenticated && category && isUploadImageModalOpen && (
        <Modal
          isOpen={isUploadImageModalOpen}
          onClose={() => setIsUploadImageModalOpen(false)}
          title='Upload New Image'
        >
          <ImageUploadForm
            categoryId={category.id}
            onSubmit={handleUploadImage}
            onCancel={() => setIsUploadImageModalOpen(false)}
            isLoading={isSubmitting}
            error={formError}
          />
        </Modal>
      )}

      {isAuthenticated && category && isDeleteCategoryDialogOpen && (
        <AlertDialog
          isOpen={isDeleteCategoryDialogOpen}
          onClose={() => setIsDeleteCategoryDialogOpen(false)}
          onConfirm={handleDeleteCategory}
          title='Delete Category'
          message={`Are you sure you want to delete the category "${category.name}"? All images within this category might also be affected based on server settings. This action cannot be undone.`}
          confirmText='Delete Category'
        />
      )}
    </div>
  );
};

export default CategoryDetail;
