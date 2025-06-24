import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { getCategories } from '../services/api';
import type { CategoryReadWithImages, ApiError } from '../types';
import { MAX_CATEGORIES_TO_LOAD_IMAGES_FROM } from '../constants';

interface CategoryContextState {
  categories: CategoryReadWithImages[];
  isLoading: boolean;
  error: ApiError | string | null;
  fetchCategories: () => Promise<void>; // To allow manual refetch if needed
}

const CategoryContext = createContext<CategoryContextState | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<CategoryReadWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | string | null>(null);

  const fetchCategoriesCallback = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const basicCategories = await getCategories(0, MAX_CATEGORIES_TO_LOAD_IMAGES_FROM);
      // Map to CategoryReadWithImages, assuming images will be populated later if needed by specific views,
      // or if getCategories itself starts returning images directly.
      // For now, CategorySearch only needs CategoryRead properties.
      const categoriesForState: CategoryReadWithImages[] = basicCategories.map(c => ({
        ...c,
        images: [], // Initialize images as an empty array, as CategoryRead doesn't have it.
      }));
      setCategories(categoriesForState);
    } catch (err) {
      setError(err as ApiError);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesCallback();
  }, [fetchCategoriesCallback]);

  return (
    <CategoryContext.Provider
      value={{ categories, isLoading, error, fetchCategories: fetchCategoriesCallback }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = (): CategoryContextState => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
