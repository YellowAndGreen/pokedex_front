import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../constants';
import { useCategories } from '../contexts/CategoryContext';
import { useTheme } from '../contexts/ThemeContext';
import { getAllTags, getCategoryByName, searchImagesByTag } from '../services/api';
import type { ApiError, CategoryRead, ImageRead, TagRead } from '../types';
import ErrorDisplay from './ErrorDisplay';
import {
  ArrowRightOnRectangleIcon,
  ImagePlaceholderIcon,
  RectangleStackIcon,
  SearchIcon,
  TagIcon,
  XMarkIcon,
} from './icons';
import LoadingSpinner from './LoadingSpinner';

interface CategorySearchProps {
  isExpanded: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

type SearchMode =
  | 'initial_or_empty' // Default, or query cleared but not yet processing
  | 'browsing_all_tags' // Query is empty, dropdown shows all available tags
  | 'no_tags_to_browse' // Query is empty, no tags available in the system
  | 'specific_search_loading' // Actively searching for specific query
  | 'specific_search_category_found' // Category by name found
  | 'specific_search_images_found' // Images by tag found
  | 'specific_search_tag_link_only' // Tag exists (from allTagsFromApiRef), but searchImagesByTag yielded no images or failed.
  | 'specific_search_no_results' // Conceptual state for a "total miss", UI will not reflect this directly but keep old results.
  | 'specific_search_error'; // API error during specific search, not covered by other states

const ANIMATION_DURATION = 300;

const getRelativeUrl = (absoluteUrl: string | null | undefined): string | null | undefined => {
  if (absoluteUrl && absoluteUrl.startsWith(IMAGE_BASE_URL)) {
    return absoluteUrl.substring(IMAGE_BASE_URL.length);
  }
  return absoluteUrl;
};

interface ImageResultItemProps {
  image: ImageRead;
  onClick: () => void;
}

const ImageResultItem: React.FC<ImageResultItemProps> = ({ image, onClick }) => {
  const { theme } = useTheme();
  const [loadError, setLoadError] = useState(false);
  const src = getRelativeUrl(image.thumbnail_url);

  useEffect(() => {
    setLoadError(false);
  }, [src]);

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm ${theme.dropdown.itemText} ${theme.dropdown.itemHoverBg} ${theme.dropdown.itemHoverText} transition-colors duration-150`}
    >
      {src && !loadError ? (
        <img
          src={src}
          alt={image.title || 'thumbnail'}
          className='w-8 h-8 object-cover rounded mr-2.5 flex-shrink-0'
          onError={() => setLoadError(true)}
        />
      ) : (
        <div
          className={`w-8 h-8 flex-shrink-0 mr-2.5 flex items-center justify-center ${theme.skeletonBase} ${theme.card.rounded}`}
        >
          <ImagePlaceholderIcon className={`w-5 h-5 opacity-60 ${theme.card.secondaryText}`} />
        </div>
      )}
      <span className='truncate'>{image.title || image.original_filename}</span>
    </button>
  );
};

const CategorySearch: React.FC<CategorySearchProps> = ({ isExpanded, onFocus, onBlur }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [categoryResult, setCategoryResult] = useState<CategoryRead | null>(null);
  const [imageResults, setImageResults] = useState<ImageRead[]>([]);
  const [tagsForBrowsing, setTagsForBrowsing] = useState<TagRead[]>([]);
  const allTagsFromApiRef = useRef<TagRead[]>([]);

  const [searchMode, setSearchMode] = useState<SearchMode>('initial_or_empty');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const componentRootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const actualInputContainerRef = useRef<HTMLDivElement>(null);

  const [isMountedInPortal, setIsMountedInPortal] = useState(false);
  const [isVisibleInPortal, setIsVisibleInPortal] = useState(false);

  const { categories: allCategoriesFromContext, isLoading: isLoadingCategoriesContext } =
    useCategories();

  const [prefixMatchedCategories, setPrefixMatchedCategories] = useState<CategoryRead[]>([]);

  useEffect(() => {
    let visibilityTimer: ReturnType<typeof setTimeout>;
    let unmountTimer: ReturnType<typeof setTimeout>;

    if (isExpanded) {
      setIsMountedInPortal(true);
      visibilityTimer = setTimeout(() => {
        setIsVisibleInPortal(true);
      }, 20);
    } else {
      setIsVisibleInPortal(false);
      unmountTimer = setTimeout(() => {
        setIsMountedInPortal(false);
      }, ANIMATION_DURATION);
    }

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(unmountTimer);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (isVisibleInPortal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisibleInPortal]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 350);
    return () => clearTimeout(handler);
  }, [query]);

  const performSpecificSearch = useCallback(
    async (searchQuery: string, allKnownTags: TagRead[]) => {
      const trimmedQuery = searchQuery.trim();
      // useEffect ensures trimmedQuery is not empty when calling this.

      setIsLoading(true);
      setError(null); // Clear previous API error for this new specific search.

      // 1. Check context categories (synchronous)
      if (
        !isLoadingCategoriesContext &&
        allCategoriesFromContext &&
        allCategoriesFromContext.length > 0
      ) {
        const foundInContext = allCategoriesFromContext.find(
          cat => cat.name.toLowerCase() === trimmedQuery.toLowerCase()
        );
        if (foundInContext) {
          setCategoryResult(foundInContext as CategoryRead);
          setImageResults([]);
          setSearchMode('specific_search_category_found');
          setIsLoading(false);
          // isDropdownOpen is already managed by useEffect to be true here
          return;
        }
      }

      // 2. API Searches for Category
      try {
        const categoryData = await getCategoryByName(trimmedQuery);
        setCategoryResult(categoryData);
        setImageResults([]);
        setSearchMode('specific_search_category_found');
        setIsLoading(false);
        // isDropdownOpen is managed by useEffect
        return;
      } catch (catError: any) {
        if (catError.status !== 404) {
          // Critical error finding category
          setError((catError as ApiError) || { message: 'Error searching categories.' });
          setCategoryResult(null);
          setImageResults([]);
          setSearchMode('specific_search_error');
          setIsLoading(false);
          // isDropdownOpen is managed by useEffect
          return;
        }
        // Category not found (404), proceed to search images by tag
      }

      // 3. API Search for Images by Tag (if category not found and no critical catError)
      try {
        const imagesData = await searchImagesByTag(trimmedQuery);
        if (imagesData.length > 0) {
          setImageResults(imagesData);
          setCategoryResult(null);
          setSearchMode('specific_search_images_found');
          setIsLoading(false);
          // isDropdownOpen is managed by useEffect
          return;
        } else {
          // No images found by tag. Check if the tag itself exists.
          const knownTagExists = allKnownTags.some(
            tag => tag.name.toLowerCase() === trimmedQuery.toLowerCase()
          );
          if (knownTagExists) {
            setCategoryResult(null);
            setImageResults([]); // Clear other specific results
            setSearchMode('specific_search_tag_link_only');
            setIsLoading(false);
            // isDropdownOpen is managed by useEffect
            return;
          } else {
            // TOTAL MISS: No category, no images by tag, tag doesn't exist.
            // 不做任何内容清空或错误提示，保持原有内容
            setIsLoading(false);
            // 不设置 error、searchMode、categoryResult、imageResults
            return;
          }
        }
      } catch (imgError: any) {
        // Critical error during image search
        const knownTagExists = allKnownTags.some(
          tag => tag.name.toLowerCase() === trimmedQuery.toLowerCase()
        );
        if (knownTagExists) {
          // If tag link can be offered despite image search error
          setCategoryResult(null);
          setImageResults([]);
          setSearchMode('specific_search_tag_link_only');
          setError(null); // Don't show imgError if tag link is available
        } else {
          setError((imgError as ApiError) || { message: 'Error searching images by tag.' });
          setCategoryResult(null);
          setImageResults([]);
          setSearchMode('specific_search_error');
        }
        setIsLoading(false);
        // isDropdownOpen is managed by useEffect
        return;
      }
    },
    [allCategoriesFromContext, isLoadingCategoriesContext]
  );

  useEffect(() => {
    const fetchAllTagsIfNeededAndSetBrowsingMode = async () => {
      if (allTagsFromApiRef.current.length === 0) {
        setIsLoading(true);
        setError(null);
        // Explicitly clear specific search results for browse mode
        setCategoryResult(null);
        setImageResults([]);
        setTagsForBrowsing([]);
        setSearchMode('specific_search_loading');
        try {
          const apiTags = await getAllTags();
          allTagsFromApiRef.current = apiTags;
          setTagsForBrowsing(apiTags.slice(0, 100));
          setSearchMode(apiTags.length > 0 ? 'browsing_all_tags' : 'no_tags_to_browse');
          setError(null); // Clear error on successful tag fetch
        } catch (err) {
          setError(err as ApiError);
          setSearchMode('no_tags_to_browse');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Using cached tags
        setCategoryResult(null);
        setImageResults([]); // Clear specific search results
        setTagsForBrowsing(allTagsFromApiRef.current.slice(0, 100));
        setSearchMode(
          allTagsFromApiRef.current.length > 0 ? 'browsing_all_tags' : 'no_tags_to_browse'
        );
        setIsLoading(false);
        setError(null); // Clear error as we are in browse mode
      }
      setIsDropdownOpen(true); // Open dropdown for browse mode
    };

    if (isVisibleInPortal) {
      const trimmedQuery = debouncedQuery.trim();
      if (trimmedQuery) {
        // 前缀匹配逻辑
        if (
          !isLoadingCategoriesContext &&
          allCategoriesFromContext &&
          allCategoriesFromContext.length > 0
        ) {
          const prefixMatches = allCategoriesFromContext.filter(cat =>
            cat.name.toLowerCase().startsWith(trimmedQuery.toLowerCase())
          );
          if (prefixMatches.length > 0) {
            setPrefixMatchedCategories(prefixMatches);
            setCategoryResult(null);
            setImageResults([]);
            setTagsForBrowsing([]);
            setSearchMode('specific_search_category_found');
            setIsDropdownOpen(true);
            setIsLoading(false);
            setError(null);
            return;
          }
        }
        // 若无前缀匹配，清空 prefixMatchedCategories，走原有逻辑
        setPrefixMatchedCategories([]);
        setTagsForBrowsing([]); // Clear tags when starting specific search
        setIsDropdownOpen(true); // Open dropdown for specific search results or to show preserved results
        performSpecificSearch(trimmedQuery, allTagsFromApiRef.current);
      } else if (!query.trim()) {
        // If both debounced and current query are empty (true empty state)
        setPrefixMatchedCategories([]);
        setCategoryResult(null);
        setImageResults([]); // Clear specific search results for browse mode
        fetchAllTagsIfNeededAndSetBrowsingMode();
      } else {
        // Query has content (e.g. spaces), but debounced is empty (effectively empty for search)
        setPrefixMatchedCategories([]);
        setIsDropdownOpen(false); // Close dropdown. Previous results (if any) are kept but hidden.
        setError(null); // Clear any errors if query is effectively empty.
        // Do not change searchMode here to preserve previous results, just hide them.
        // Or, if desired, reset to 'initial_or_empty':
        // setSearchMode('initial_or_empty'); setCategoryResult(null); setImageResults([]);
      }
    } else {
      setPrefixMatchedCategories([]);
      setQuery('');
      setDebouncedQuery('');
      setCategoryResult(null);
      setImageResults([]);
      setTagsForBrowsing([]);
      setError(null);
      setIsLoading(false);
      setIsDropdownOpen(false);
      setSearchMode('initial_or_empty');
    }
  }, [debouncedQuery, query, isVisibleInPortal, performSpecificSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!e.target.value.trim()) {
      setDebouncedQuery('');
    }
  };

  const cleanupAfterSelection = () => {
    setQuery('');
    setDebouncedQuery('');
    setCategoryResult(null);
    setImageResults([]);
    setTagsForBrowsing([]);
    setError(null);
    setIsDropdownOpen(false);
    setSearchMode('initial_or_empty');
    if (inputRef.current) {
      inputRef.current.blur();
    }
    onBlur();
  };

  const handleCategoryResultClick = (category: CategoryRead) => {
    navigate(`/categories/${category.id}`);
    cleanupAfterSelection();
  };
  const handleImageResultClick = (image: ImageRead) => {
    navigate(`/categories/${image.category_id}?imageId=${image.id}`);
    cleanupAfterSelection();
  };
  const handleGoToTagPageClick = (tagName: string) => {
    navigate(`/tags/${encodeURIComponent(tagName)}`);
    cleanupAfterSelection();
  };

  const handleInputFocus = () => {
    if (!isExpanded) {
      onFocus();
    }
    if (isVisibleInPortal && !isDropdownOpen) {
      // Only act if dropdown is currently closed
      if (!query.trim()) {
        // If input is empty on focus
        setDebouncedQuery(''); // Trigger browse mode
      } else {
        // Input has content on focus
        // If there's already results/loading/error for this query, open dropdown
        if (
          isLoading ||
          error ||
          categoryResult ||
          imageResults.length > 0 ||
          searchMode === 'specific_search_tag_link_only'
        ) {
          setIsDropdownOpen(true);
        } else {
          // If no current results for this query, a new debounced search will trigger via useEffect
        }
      }
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) {
        cleanupAfterSelection();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded, cleanupAfterSelection]);

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isVisibleInPortal && isDropdownOpen && actualInputContainerRef.current) {
      const inputRect = actualInputContainerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: inputRect.bottom + 8,
        left: inputRect.left,
        width: inputRect.width,
      });
    }
  }, [
    isVisibleInPortal,
    isDropdownOpen,
    query,
    categoryResult,
    imageResults,
    tagsForBrowsing,
    searchMode,
    actualInputContainerRef,
  ]); // Added searchMode to re-calc position if content changes

  const searchInterface = (
    <>
      <div
        onClick={cleanupAfterSelection}
        className={`fixed inset-0 z-45 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity duration-${ANIMATION_DURATION}
          ${isVisibleInPortal ? 'opacity-100' : 'opacity-0'}
          ${!isVisibleInPortal ? 'pointer-events-none' : ''}
        `}
        aria-hidden='true'
      />

      <div
        className={`
          fixed left-4 right-4 md:left-8 md:right-8 lg:mx-auto lg:max-w-3xl xl:max-w-4xl
          p-3 sm:p-2 flex items-center z-50
          transition-all duration-${ANIMATION_DURATION} ease-[cubic-bezier(0.4,0,0.2,1)]
          top-16 
          ${isVisibleInPortal ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          ${!isVisibleInPortal ? 'pointer-events-none' : ''}
        `}
      >
        <div
          ref={actualInputContainerRef}
          className={`
                flex items-center flex-grow h-9 sm:h-10
                ${theme.input.bg} ${theme.input.border} ${theme.card.rounded} ${theme.card.shadow}
                px-3 sm:px-4 
                transition-opacity duration-200 ease-in-out 
                ${isVisibleInPortal ? 'opacity-100' : 'opacity-0'}
                `}
        >
          <SearchIcon
            className={`h-4 w-4 sm:h-5 sm:h-5 flex-shrink-0 ${theme.input.placeholderText} mr-2 sm:mr-3`}
          />
          <input
            ref={inputRef}
            type='search'
            placeholder='Search categories or image tag...'
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className={`
                flex-grow h-full bg-transparent text-xs sm:text-sm focus:outline-none 
                ${theme.input.text} ${theme.input.placeholderText}
                `}
            aria-label='Search categories or by image tag'
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className='p-1'
              aria-label='Clear search query'
            >
              <XMarkIcon className={`h-4 w-4 sm:h-5 sm:h-5 ${theme.iconButton}`} />
            </button>
          )}
        </div>
      </div>

      {isVisibleInPortal && isDropdownOpen && dropdownPosition.width > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
          className={`
            ${theme.dropdown.bg} ${theme.card.rounded} ${theme.modal.shadow} 
            z-55 overflow-y-auto max-h-[calc(100vh-4rem-1rem-4rem-1rem)] 
            scrollbar-thin animate-fadeInUp`}
          onMouseDown={e => e.preventDefault()}
        >
          {isLoading && searchMode === 'specific_search_loading' && (
            <div className='p-4 flex justify-center items-center'>
              <LoadingSpinner size='sm' />
              <span className={`ml-2 text-xs ${theme.card.secondaryText}`}>Loading...</span>
            </div>
          )}
          {/* Display API error if it exists and not loading. Preserved results might be shown alongside error if previous search was successful and current failed with error.*/}
          {error && searchMode === 'specific_search_error' && !isLoading && (
            <div className='p-2 text-xs sm:text-sm'>
              <ErrorDisplay error={error} />
            </div>
          )}

          {/* Display results based on searchMode, error state, and isLoading */}
          {!isLoading && (!error || searchMode !== 'specific_search_error') && (
            <>
              {/* 前缀匹配种类展示 */}
              {searchMode === 'specific_search_category_found' &&
                prefixMatchedCategories.length > 0 && (
                  <>
                    <div
                      className={`px-3 pt-2 pb-1 text-xs font-semibold ${theme.card.secondaryText.replace('text-slate-600', 'text-slate-500').replace('dark:text-slate-300', 'dark:text-slate-400')}`}
                    >
                      {`Found ${prefixMatchedCategories.length} categor${prefixMatchedCategories.length > 1 ? 'ies' : 'y'} matching "${debouncedQuery}"`}
                    </div>
                    {prefixMatchedCategories.slice(0, 15).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryResultClick(cat)}
                        className={`flex items-center w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm ${theme.dropdown.itemText} ${theme.dropdown.itemHoverBg} ${theme.dropdown.itemHoverText} transition-colors duration-150`}
                      >
                        <RectangleStackIcon
                          className={`w-4 h-4 mr-2 flex-shrink-0 ${theme.brandColor}`}
                        />
                        <span className='truncate'>{cat.name}</span>
                      </button>
                    ))}
                    {prefixMatchedCategories.length > 15 && (
                      <div className={`px-3 py-2 text-xs ${theme.card.secondaryText}`}>
                        仅显示前 15 项，建议输入更完整名称以缩小范围。
                      </div>
                    )}
                  </>
                )}
              {searchMode === 'specific_search_category_found' &&
                categoryResult &&
                prefixMatchedCategories.length === 0 && (
                  <button
                    onClick={() => handleCategoryResultClick(categoryResult)}
                    className={`flex items-center w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm ${theme.dropdown.itemText} ${theme.dropdown.itemHoverBg} ${theme.dropdown.itemHoverText} transition-colors duration-150`}
                  >
                    <RectangleStackIcon
                      className={`w-4 h-4 mr-2 flex-shrink-0 ${theme.brandColor}`}
                    />
                    <span className='truncate'>{categoryResult.name}</span>
                  </button>
                )}
              {(searchMode === 'specific_search_images_found' ||
                searchMode === 'specific_search_tag_link_only') &&
                debouncedQuery.trim() && (
                  <button
                    onClick={() => handleGoToTagPageClick(debouncedQuery)}
                    className={`flex items-center w-full text-left px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold 
                               ${theme.dropdown.itemText} ${theme.dropdown.itemHoverBg} ${theme.dropdown.itemHoverText} 
                               border-b ${theme.input.border} transition-colors duration-150`}
                  >
                    <ArrowRightOnRectangleIcon
                      className={`w-4 h-4 mr-2 flex-shrink-0 ${theme.brandColor}`}
                    />
                    <span>Go to tag page: "{debouncedQuery}"</span>
                  </button>
                )}
              {searchMode === 'specific_search_images_found' && imageResults.length > 0 && (
                <>
                  <div
                    className={`px-3 pt-2 pb-1 text-xs font-semibold ${theme.card.secondaryText.replace('text-slate-600', 'text-slate-500').replace('dark:text-slate-300', 'dark:text-slate-400')}`}
                  >
                    Images found for tag: "{debouncedQuery}"
                  </div>
                  {imageResults.slice(0, 15).map(img => (
                    <ImageResultItem
                      key={img.id}
                      image={img}
                      onClick={() => handleImageResultClick(img)}
                    />
                  ))}
                  {imageResults.length > 15 && (
                    <button
                      onClick={() => handleGoToTagPageClick(debouncedQuery)}
                      className={`block w-full text-center px-3 py-2 sm:px-4 sm:py-2.5 text-xs font-medium ${theme.dropdown.itemText} ${theme.dropdown.itemHoverBg} ${theme.dropdown.itemHoverText} transition-colors duration-150`}
                    >
                      View all {imageResults.length} images...
                    </button>
                  )}
                </>
              )}
              {searchMode === 'browsing_all_tags' && tagsForBrowsing.length > 0 && (
                <>
                  <div
                    className={`px-3 pt-2.5 pb-1.5 text-xs font-semibold ${theme.card.secondaryText.replace('text-slate-600', 'text-slate-500').replace('dark:text-slate-300', 'dark:text-slate-400')}`}
                  >
                    Browse all tags ({tagsForBrowsing.length}
                    {allTagsFromApiRef.current.length > tagsForBrowsing.length
                      ? ` of ${allTagsFromApiRef.current.length}`
                      : ''}
                    ):
                  </div>
                  {tagsForBrowsing.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleGoToTagPageClick(tag.name)}
                      className={`flex items-center w-full text-left px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm ${theme.dropdown.itemText} ${theme.dropdown.itemHoverBg} ${theme.dropdown.itemHoverText} transition-colors duration-150`}
                    >
                      <TagIcon
                        className={`w-3.5 h-3.5 mr-2 opacity-80 flex-shrink-0 ${theme.brandColor}`}
                      />
                      <span className='truncate'>{tag.name}</span>
                    </button>
                  ))}
                </>
              )}
              {searchMode === 'no_tags_to_browse' && !isLoading && (
                <div
                  className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm ${theme.card.secondaryText}`}
                >
                  No tags available in the system.
                </div>
              )}
              {/* Case for specific_search_no_results is intentionally omitted to show nothing, as per user request */}
            </>
          )}
        </div>
      )}
    </>
  );

  if (!isMountedInPortal) {
    return (
      <div
        ref={componentRootRef}
        className='flex-grow max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl h-full'
      >
        <button
          onClick={onFocus}
          className={`p-2 rounded-full focus:outline-none transition-colors duration-150 ease-in-out ${theme.iconButton} focus-visible:ring-2 ${theme.input.focusRing.replace('focus:ring-2 focus:', 'focus-visible:')}`}
          aria-label='Open search bar'
        >
          <SearchIcon className='h-5 w-5' />
        </button>
      </div>
    );
  }

  return ReactDOM.createPortal(searchInterface, document.body);
};

export default CategorySearch;
