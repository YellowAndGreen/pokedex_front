
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getCategoryByName, searchImagesByTag, getAllTags } from '../services/api'; 
import type { CategoryRead, ImageRead, TagRead, ApiError } from '../types'; 
import { SearchIcon, XMarkIcon, PhotoIcon, RectangleStackIcon, ImagePlaceholderIcon, ArrowRightOnRectangleIcon, TagIcon } from './icons'; 
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { useTheme } from '../contexts/ThemeContext';
import { useCategories } from '../contexts/CategoryContext';
import { IMAGE_BASE_URL } from '../constants'; // Added IMAGE_BASE_URL import

interface CategorySearchProps {
  isExpanded: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

type SearchMode = 
  'initial_or_empty' |                // Default, or query cleared but not yet processing
  'browsing_all_tags' |               // Query is empty, dropdown shows all available tags
  'no_tags_to_browse' |               // Query is empty, no tags available in the system
  'specific_search_loading' |         // Actively searching for specific query
  'specific_search_category_found' |  // Category by name found
  'specific_search_images_found' |    // Images by tag found
  'specific_search_tag_link_only' |   // Tag exists (from allTagsFromApiRef), but searchImagesByTag yielded no images or failed.
  'specific_search_no_results' |      // Nothing found for the specific query (not a category, no images by tag, not a known browsable tag)
  'specific_search_error';            // API error during specific search, not covered by other states

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
  const src = getRelativeUrl(image.thumbnail_url); // Transform URL

  useEffect(() => {
    setLoadError(false);
  }, [src]);

  return (
    <button onClick={onClick} className={`flex items-center w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm ${theme.dropdown.itemText} ${theme.dropdown.itemHoverBg} ${theme.dropdown.itemHoverText} transition-colors duration-150`}>
      {src && !loadError ? (
        <img 
          src={src} 
          alt={image.title || 'thumbnail'} 
          className="w-8 h-8 object-cover rounded mr-2.5 flex-shrink-0" 
          onError={() => setLoadError(true)}
        />
      ) : (
        <div className={`w-8 h-8 flex-shrink-0 mr-2.5 flex items-center justify-center ${theme.skeletonBase} ${theme.card.rounded}`}>
          <ImagePlaceholderIcon className={`w-5 h-5 opacity-60 ${theme.card.secondaryText}`} />
        </div>
      )}
      <span className="truncate">{image.title || image.original_filename}</span>
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
  const [tagsForBrowsing, setTagsForBrowsing] = useState<TagRead[]>([]); // For displaying in "browse tags" mode
  const allTagsFromApiRef = useRef<TagRead[]>([]); // Stores all tags fetched once

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

  const { categories: allCategoriesFromContext, isLoading: isLoadingCategoriesContext } = useCategories();

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

  const performSpecificSearch = useCallback(async (searchQuery: string, allKnownTags: TagRead[]) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return;
    }

    setIsLoading(true); 
    // setError(null); // Error is now cleared before calling this in useEffect
    setCategoryResult(null); 
    setImageResults([]); 
    setIsDropdownOpen(true);
    setSearchMode('specific_search_loading');

    if (!isLoadingCategoriesContext && allCategoriesFromContext && allCategoriesFromContext.length > 0) {
      const foundInContext = allCategoriesFromContext.find(cat => cat.name.toLowerCase() === trimmedQuery.toLowerCase());
      if (foundInContext) {
        setCategoryResult(foundInContext as CategoryRead); 
        setSearchMode('specific_search_category_found'); 
        setError(null);
        setIsLoading(false); 
        return;
      }
    }

    try {
      const categoryData = await getCategoryByName(trimmedQuery);
      setCategoryResult(categoryData); 
      setSearchMode('specific_search_category_found');
      setError(null); 
    } catch (catError: any) {
      if (catError.status === 404) {
        try {
          const imagesData = await searchImagesByTag(trimmedQuery);
          if (imagesData.length > 0) { 
            setImageResults(imagesData); 
            setSearchMode('specific_search_images_found'); 
            setError(null); 
          } else {
            const knownTagExists = allKnownTags.some(tag => tag.name.toLowerCase() === trimmedQuery.toLowerCase());
            if (knownTagExists) {
              setSearchMode('specific_search_tag_link_only');
              setError(null); 
            } else {
              setError({ message: `No category, images, or matching tag found for "${trimmedQuery}".` }); 
              setSearchMode('specific_search_no_results');
            }
          }
        } catch (imgError: any) { 
          const knownTagExists = allKnownTags.some(tag => tag.name.toLowerCase() === trimmedQuery.toLowerCase());
          if (knownTagExists) {
            setSearchMode('specific_search_tag_link_only');
            setError(null); 
          } else {
            setError(imgError as ApiError || { message: "Error searching images by tag."}); 
            setSearchMode('specific_search_error');
          }
        }
      } else { 
        setError(catError as ApiError || { message: "Error searching categories."}); 
        setSearchMode('specific_search_error'); 
      }
    } finally { 
      setIsLoading(false); 
    }
  }, [allCategoriesFromContext, isLoadingCategoriesContext]);


  useEffect(() => {
    const fetchAllTagsIfNeededAndSetBrowsingMode = async () => {
        if (allTagsFromApiRef.current.length === 0) { 
            setIsLoading(true); setError(null);
            setCategoryResult(null); setImageResults([]); setTagsForBrowsing([]);
            setSearchMode('specific_search_loading'); 
            try {
                const apiTags = await getAllTags();
                allTagsFromApiRef.current = apiTags;
                setTagsForBrowsing(apiTags.slice(0, 100));
                setSearchMode(apiTags.length > 0 ? 'browsing_all_tags' : 'no_tags_to_browse');
                setError(null);
            } catch (err) {
                setError(err as ApiError);
                setSearchMode('no_tags_to_browse'); 
            } finally {
                setIsLoading(false);
            }
        } else {
            setCategoryResult(null); setImageResults([]);
            setTagsForBrowsing(allTagsFromApiRef.current.slice(0, 100));
            setSearchMode(allTagsFromApiRef.current.length > 0 ? 'browsing_all_tags' : 'no_tags_to_browse');
            setIsLoading(false); 
            setError(null);
        }
        setIsDropdownOpen(true);
    };

    if (isVisibleInPortal) {
        if (debouncedQuery.trim()) {
            setError(null); // Explicitly clear error before a new specific search
            setTagsForBrowsing([]); 
            performSpecificSearch(debouncedQuery, allTagsFromApiRef.current);
        } else if (!query.trim()) { 
            // Error is cleared within fetchAllTagsIfNeededAndSetBrowsingMode on success/cache use
            fetchAllTagsIfNeededAndSetBrowsingMode();
        } else {
            // This case handles when query might have content (e.g. whitespace) but debouncedQuery is empty,
            // or user cleared input rapidly. We are not searching, so clear any errors.
            setSearchMode('initial_or_empty');
            setIsDropdownOpen(false);
            setError(null); 
        }
    } else {
        setQuery(''); setDebouncedQuery('');
        setCategoryResult(null); setImageResults([]); setTagsForBrowsing([]);
        setError(null); setIsLoading(false); setIsDropdownOpen(false);
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
    setCategoryResult(null); setImageResults([]); setTagsForBrowsing([]); setError(null); 
    setIsDropdownOpen(false); 
    setSearchMode('initial_or_empty');
    if (inputRef.current) inputRef.current.blur(); 
    onBlur(); 
  };
  
  const handleCategoryResultClick = (category: CategoryRead) => { navigate(`/categories/${category.id}`); cleanupAfterSelection(); };
  const handleImageResultClick = (image: ImageRead) => { navigate(`/categories/${image.category_id}?imageId=${image.id}`); cleanupAfterSelection(); };
  const handleGoToTagPageClick = (tagName: string) => { navigate(`/tags/${encodeURIComponent(tagName)}`); cleanupAfterSelection(); };


  const handleInputFocus = () => {
    if(!isExpanded) onFocus(); 
    if (isVisibleInPortal && !isDropdownOpen) {
        if (!query.trim()) { 
           setDebouncedQuery(''); 
        } else {
           if (isLoading || error || categoryResult || imageResults.length > 0) {
             setIsDropdownOpen(true);
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
  }, [isVisibleInPortal, isDropdownOpen, query, categoryResult, imageResults, tagsForBrowsing, actualInputContainerRef]); 

  const searchInterface = (
    <>
      <div 
        onClick={cleanupAfterSelection} 
        className={`fixed inset-0 z-45 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity duration-${ANIMATION_DURATION}
          ${isVisibleInPortal ? 'opacity-100' : 'opacity-0'}
          ${!isVisibleInPortal ? 'pointer-events-none' : ''}
        `}
        aria-hidden="true"
      />

      <div 
        className={`
          fixed left-4 right-4 md:left-8 md:right-8 lg:mx-auto lg:max-w-3xl xl:max-w-4xl
          p-3 sm:p-2 flex items-center z-50
          transition-all duration-${ANIMATION_DURATION} ease-[cubic-bezier(0.4,0,0.2,1)]
          top-16 
          ${isVisibleInPortal
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
          }
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
            <SearchIcon className={`h-4 w-4 sm:h-5 sm:h-5 flex-shrink-0 ${theme.input.placeholderText} mr-2 sm:mr-3`} />
            <input
                ref={inputRef}
                type="search"
                placeholder="Search categories or image tag..."
                value={query}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                className={`
                flex-grow h-full bg-transparent text-xs sm:text-sm focus:outline-none 
                ${theme.input.text} ${theme.input.placeholderText}
                `}
                aria-label="Search categories or by image tag"
            />
            {query && (
                <button
                onClick={() => { setQuery(''); inputRef.current?.focus(); }} 
                className="p-1"
                aria-label="Clear search query"
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
          onMouseDown={(e) => e.preventDefault()} 
        >
          {searchMode === 'specific_search_loading' && (
            <div className="p-4 flex justify-center items-center">
              <LoadingSpinner size="sm" /><span className={`ml-2 text-xs ${theme.card.secondaryText}`}>Loading...</span>
            </div>
          )}
          {searchMode !== 'specific_search_loading' && error && searchMode !== 'specific_search_tag_link_only' && ( 
            <div className="p-2 text-xs sm:text-sm"><ErrorDisplay error={error} /></div>
          )}

          {searchMode === 'specific_search_category_found' && categoryResult && (
            <button onClick={() => handleCategoryResultClick(categoryResult)} className={`flex items-center w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm ${theme.dropdown.itemText} ${theme.dropdown.itemHoverBg} ${theme.dropdown.itemHoverText} transition-colors duration-150`}>
              <RectangleStackIcon className={`w-4 h-4 mr-2 flex-shrink-0 ${theme.brandColor}`} />
              <span className="truncate">{categoryResult.name}</span>
            </button>
          )}
          {searchMode === 'specific_search_images_found' && imageResults.length > 0 && (
            <div>
              <button 
                onClick={() => handleGoToTagPageClick(debouncedQuery)}
                className={`flex items-center w-full text-left px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold 
                           ${theme.dropdown.itemText} ${theme.dropdown.itemHoverBg} ${theme.dropdown.itemHoverText} 
                           border-b ${theme.input.border} transition-colors duration-150`}
              >
                <ArrowRightOnRectangleIcon className={`w-4 h-4 mr-2 flex-shrink-0 ${theme.brandColor}`} />
                <span>Go to tag page: "{debouncedQuery}"</span>
              </button>
              <div className={`px-3 pt-2 pb-1 text-xs font-semibold ${theme.card.secondaryText}`}>Images found for tag: "{debouncedQuery}"</div>
              {imageResults.map(img => (
                <ImageResultItem key={img.id} image={img} onClick={() => handleImageResultClick(img)} />
              ))}
            </div>
          )}
          {searchMode === 'specific_search_tag_link_only' && (
             <button 
                onClick={() => handleGoToTagPageClick(debouncedQuery)}
                className={`flex items-center w-full text-left px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold 
                           ${theme.dropdown.itemText} ${theme.dropdown.itemHoverBg} ${theme.dropdown.itemHoverText} 
                           transition-colors duration-150`}
              >
                <ArrowRightOnRectangleIcon className={`w-4 h-4 mr-2 flex-shrink-0 ${theme.brandColor}`} />
                <span>Go to tag page: "{debouncedQuery}"</span>
            </button>
          )}

          {searchMode === 'browsing_all_tags' && tagsForBrowsing.length > 0 && (
            <>
              <div className={`px-3 pt-2.5 pb-1.5 text-xs font-semibold ${theme.card.secondaryText}`}>Browse Tags (First 100)</div>
              {tagsForBrowsing.map(tag => (
                  <button
                      key={tag.id}
                      onClick={() => handleGoToTagPageClick(tag.name)}
                      className={`flex items-center w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm ${theme.dropdown.itemText} ${theme.dropdown.itemHoverBg} ${theme.dropdown.itemHoverText} transition-colors duration-150`}
                  >
                      <TagIcon className={`w-3.5 h-3.5 mr-2 flex-shrink-0 ${theme.iconButton}`} />
                      <span className="truncate">{tag.name}</span>
                  </button>
              ))}
            </>
          )}
          
          {searchMode === 'specific_search_no_results' && !isLoading && !error && ( 
            <div className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm ${theme.card.secondaryText}`}>No results for "{debouncedQuery}".</div>
          )}
          {searchMode === 'no_tags_to_browse' && !isLoading && !error && (
            <div className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm ${theme.card.secondaryText}`}>No tags available to browse.</div>
          )}
          
           {searchMode === 'initial_or_empty' && !isLoading && !query.trim() && ( 
             <div className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm ${theme.card.secondaryText}`}>Start typing to search or browse tags.</div>
           )}
        </div>
      )}
    </>
  );

  return (
    <div ref={componentRootRef} className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
      <button
        onClick={onFocus}
        className={`p-2 rounded-full focus:outline-none transition-colors duration-150 ease-in-out ${theme.iconButton} focus-visible:ring-2 ${theme.input.focusRing.replace('focus:ring-2 focus:', 'focus-visible:')}`}
        aria-label="Open search bar"
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      {isMountedInPortal && document.body && ReactDOM.createPortal(searchInterface, document.body)}
    </div>
  );
};

export default CategorySearch;
