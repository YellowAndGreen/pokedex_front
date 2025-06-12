
import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect, useRef } from 'react';
import { createCategory } from '../services/api';
import type { CategoryCreate, ApiError, CategoryReadWithImages } from '../types';
import CategoryCard from './CategoryCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import Modal from './Modal';
import CategoryForm from './CategoryForm';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, GridViewIcon, DetailedViewIcon } from './icons';
import { useTheme } from '../contexts/ThemeContext';
import { useCategories } from '../contexts/CategoryContext'; 
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import CategoryCardSkeleton from './CategoryCardSkeleton';
import { motion } from 'framer-motion';

const LOCAL_STORAGE_COMPACT_COLUMNS_KEY = 'categoryListCompactColumns';
const LOCAL_STORAGE_ITEMS_PER_PAGE_KEY = 'categoryListItemsPerPage';
const LOCAL_STORAGE_SHOW_COMPACT_DETAILS_KEY = 'categoryListShowCompactDetails';
const ITEMS_PER_PAGE_OPTIONS = [10, 50, 100, 200, 500, 1000, 1500];
const DEFAULT_ITEMS_PER_PAGE = 50;

const SESSION_STORAGE_SCROLL_POSITION_KEY = 'categoryListScrollPosition';
const SESSION_STORAGE_CURRENT_PAGE_KEY = 'categoryListCurrentPage';

const CategoryList: React.FC = () => {
  const { theme } = useTheme();
  const { categories: allCategories, isLoading: isLoadingCategories, error: categoriesError, fetchCategories: fetchCategoriesFromContext } = useCategories();
  const { isAuthenticated } = useAuth(); // Get authentication state

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState<ApiError | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [compactViewColumns, setCompactViewColumns] = useState<number>(() => {
    if (typeof window !== 'undefined') {
        const storedColumnsStr = localStorage.getItem(LOCAL_STORAGE_COMPACT_COLUMNS_KEY);
        if (storedColumnsStr) {
            const parsedCols = parseInt(storedColumnsStr, 10);
            if (!isNaN(parsedCols) && parsedCols >= 2 && parsedCols <= 18) {
                return parsedCols;
            }
        }
        return window.innerWidth < 768 ? 4 : 8; 
    }
    return 8; 
  });


  const [showCompactDetails, setShowCompactDetails] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedState = localStorage.getItem(LOCAL_STORAGE_SHOW_COMPACT_DETAILS_KEY);
      if (storedState === null) { 
        return true; 
      }
      return storedState === 'true'; 
    }
    return true; 
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const storedItemsPerPage = localStorage.getItem(LOCAL_STORAGE_ITEMS_PER_PAGE_KEY);
      const parsedItems = parseInt(storedItemsPerPage || '', 10);
      if (ITEMS_PER_PAGE_OPTIONS.includes(parsedItems)) {
        return parsedItems;
      }
    }
    return DEFAULT_ITEMS_PER_PAGE;
  });

  const [initialSessionStateRestored, setInitialSessionStateRestored] = useState(false);
  const itemsPerPageChangedByUserInteractionRef = useRef(false);


  useEffect(() => {
    const storedColumnsStr = localStorage.getItem(LOCAL_STORAGE_COMPACT_COLUMNS_KEY);
    let newColsValue: number;

    if (storedColumnsStr) {
      const parsedCols = parseInt(storedColumnsStr, 10);
      if (!isNaN(parsedCols) && parsedCols >= 2 && parsedCols <= 18) {
        newColsValue = parsedCols; 
      } else {
        newColsValue = typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 8;
      }
    } else {
      newColsValue = typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 8;
    }
    setCompactViewColumns(Math.max(2, Math.min(newColsValue, 18)));
  }, []); 

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_COMPACT_COLUMNS_KEY, String(compactViewColumns));
  }, [compactViewColumns]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ITEMS_PER_PAGE_KEY, String(itemsPerPage));
    if (itemsPerPageChangedByUserInteractionRef.current) {
      setCurrentPage(1);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_STORAGE_CURRENT_PAGE_KEY, '1');
        window.scrollTo(0,0);
      }
      itemsPerPageChangedByUserInteractionRef.current = false;
    }
  }, [itemsPerPage]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SHOW_COMPACT_DETAILS_KEY, String(showCompactDetails));
  }, [showCompactDetails]);

  useEffect(() => {
    const saveStateToSessionStorage = () => {
        if (typeof window !== 'undefined' && initialSessionStateRestored) {
            sessionStorage.setItem(SESSION_STORAGE_SCROLL_POSITION_KEY, String(window.scrollY));
            sessionStorage.setItem(SESSION_STORAGE_CURRENT_PAGE_KEY, String(currentPage));
        }
    };
    return () => {
      saveStateToSessionStorage();
    };
  }, [currentPage, initialSessionStateRestored]);

  useLayoutEffect(() => {
    if (!isLoadingCategories && allCategories.length > 0 && !initialSessionStateRestored && typeof window !== 'undefined') {
      const savedCurrentPageString = sessionStorage.getItem(SESSION_STORAGE_CURRENT_PAGE_KEY);
      const savedScrollPositionString = sessionStorage.getItem(SESSION_STORAGE_SCROLL_POSITION_KEY);
      let pageToRestore = 1;
      const totalPagesAfterLoad = Math.max(1, Math.ceil(allCategories.length / itemsPerPage));

      if (savedCurrentPageString) {
        const savedPageNum = parseInt(savedCurrentPageString, 10);
        if (!isNaN(savedPageNum) && savedPageNum >= 1 && savedPageNum <= totalPagesAfterLoad) {
          pageToRestore = savedPageNum;
        }
      }

      if (currentPage !== pageToRestore) {
        setCurrentPage(pageToRestore);
      } else {
        if (savedScrollPositionString) {
          const scrollY = parseInt(savedScrollPositionString, 10);
          if (!isNaN(scrollY)) {
            requestAnimationFrame(() => window.scrollTo(0, scrollY));
          }
        } else if (pageToRestore > 1) {
           requestAnimationFrame(() => window.scrollTo(0, 0));
        }
        setInitialSessionStateRestored(true);
      }
    }
  }, [isLoadingCategories, allCategories, itemsPerPage, currentPage, initialSessionStateRestored]);

  const handleCreateCategory = async (categoryData: CategoryCreate) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await createCategory(categoryData);
      setIsModalOpen(false);
      await fetchCategoriesFromContext(); 
    } catch (err) {
      setFormError(err as ApiError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const skeletonCount = useMemo(() => {
    return Math.max(2, Math.min(itemsPerPage, compactViewColumns * 3));
  }, [itemsPerPage, compactViewColumns]);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [allCategories, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(allCategories.length / itemsPerPage));
  }, [allCategories, itemsPerPage]);

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
    window.scrollTo(0,0);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
    window.scrollTo(0,0);
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (initialSessionStateRestored) {
        itemsPerPageChangedByUserInteractionRef.current = true;
    }
    setItemsPerPage(Number(event.target.value));
  };

  const toggleCompactDetailsView = () => {
    setShowCompactDetails(prev => !prev);
  };

  const renderContent = () => {
    const baseGridClasses = "transition-all duration-500 ease-in-out";
    const gridStyle = {
      gridTemplateColumns: `repeat(${compactViewColumns}, minmax(0, 1fr))`,
    };
    const gridClasses = `${baseGridClasses} grid gap-2 sm:gap-3`;

    if (isLoadingCategories && allCategories.length === 0) {
      return (
        <div className={gridClasses} style={gridStyle}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <div key={index}>
              <CategoryCardSkeleton showCompactDetails={showCompactDetails} />
            </div>
          ))}
        </div>
      );
    }

    if (categoriesError && allCategories.length === 0) return <ErrorDisplay error={categoriesError} onRetry={fetchCategoriesFromContext} />;
    if (allCategories.length === 0 && !isLoadingCategories) {
      return (
        <div className="text-center py-10 animate-fadeIn">
          <p className={`text-lg sm:text-xl ${theme.card.secondaryText} mb-4`}>No categories found.</p>
          {isAuthenticated ? (
            <p className={`${theme.card.text}`}>Create one to get started!</p>
          ) : (
            <p className={`${theme.card.text}`}>Login to create categories.</p>
          )}
        </div>
      );
    }

    return (
      <div className={gridClasses} style={gridStyle}>
        {paginatedCategories.map((category, index) => {
          const displayIndex = (currentPage - 1) * itemsPerPage + index + 1;
          return (
            <motion.div
              key={category.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
            >
              <CategoryCard
                category={category}
                showCompactDetails={showCompactDetails}
                displayIndex={displayIndex}
              />
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderPaginationControls = () => {
    if (isLoadingCategories || (allCategories.length === 0 && !categoriesError)) return null;

    const basePaginationContainerClasses = "mt-6 sm:mt-10 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6";
    let borderClass = "";
    if (theme.name === 'Modern Clean Pro') borderClass = `border-t ${theme.card.border || 'border-gray-200 dark:border-gray-700'}`;

    return (
      <div className={`${basePaginationContainerClasses} ${borderClass}`}>
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPageSelect" className={`text-xs sm:text-sm ${theme.card.secondaryText} whitespace-nowrap`}>
            Items per page:
          </label>
          <select
            id="itemsPerPageSelect"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className={`py-1.5 px-2 text-xs sm:text-sm ${theme.input.bg} ${theme.input.text} ${theme.input.border} ${theme.card.rounded} ${theme.input.focusRing} ${theme.input.focusBorder}`}
            aria-label="Select number of categories per page"
          >
            {ITEMS_PER_PAGE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`p-1.5 sm:p-2 ${theme.button.secondary} ${theme.button.secondaryText} ${theme.card.rounded} ${theme.button.transition} disabled:opacity-50`}
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <span className={`text-xs sm:text-sm ${theme.card.secondaryText} select-none`}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-1.5 sm:p-2 ${theme.button.secondary} ${theme.button.secondaryText} ${theme.card.rounded} ${theme.button.transition} disabled:opacity-50`}
            aria-label="Next page"
          >
            <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-row justify-between items-center gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 flex-shrink-0"> 
          <label htmlFor="columnsSlider" className={`text-xs ${theme.card.secondaryText} select-none whitespace-nowrap`}>
            Grid Size:
          </label>
          <input
            type="range"
            id="columnsSlider"
            min="2"
            max="18" 
            step="1"
            value={compactViewColumns}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setCompactViewColumns(Math.max(2, Math.min(newValue, 18)));
            }}
            className={`w-20 sm:w-24 h-2.5 ${theme.input.bg} rounded-lg appearance-none cursor-pointer
                        ${theme.brandColor.replace('text-','accent-')}
                        focus:outline-none focus:ring-1 ${theme.input.focusRing.replace('focus:ring-2', 'focus:ring-')}
                        `}
            aria-label="Adjust number of columns in compact view"
            aria-valuetext={`${compactViewColumns} columns`}
          />
          <span className={`text-sm font-medium ${theme.brandColor} w-6 text-center select-none`}>{compactViewColumns}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0"> 
          <button
            onClick={toggleCompactDetailsView}
            className={`p-2 sm:p-2.5 ${theme.button.secondary} ${theme.button.secondaryText} ${theme.card.rounded} ${theme.button.transition} disabled:opacity-50`}
            aria-label={showCompactDetails ? "Hide category details" : "Show category details"}
            title={showCompactDetails ? "Hide Details" : "Show Details"}
          >
            {showCompactDetails ? <GridViewIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <DetailedViewIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
          {isAuthenticated && (
            <button
              onClick={() => { setIsModalOpen(true); setFormError(null); }}
              className={`p-2 sm:p-2.5 ${theme.button.primary} ${theme.button.primaryText} ${theme.card.rounded} ${theme.button.transition} disabled:opacity-50`}
              aria-label="Create new category"
              title="New Category"
            >
              <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>
      </div>

      {renderContent()}
      {renderPaginationControls()}

      {isAuthenticated && isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Category">
          <CategoryForm
            onSubmit={handleCreateCategory}
            onCancel={() => setIsModalOpen(false)}
            isLoading={isSubmitting}
            error={formError}
          />
        </Modal>
      )}
    </div>
  );
};

export default CategoryList;