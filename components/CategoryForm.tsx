
import React, { useState, useEffect } from 'react';
import type { CategoryCreate, CategoryRead, CategoryUpdate, ApiError } from '../types';
import ErrorDisplay from './ErrorDisplay';
import { useTheme } from '../contexts/ThemeContext';

interface CategoryFormProps {
  initialData?: CategoryRead;
  onSubmit: (data: CategoryCreate | CategoryUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: ApiError | string | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSubmit, onCancel, isLoading, error }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData: CategoryCreate | CategoryUpdate = {
      name,
      description: description || null,
    };
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {error && <ErrorDisplay error={error} />}
      <div>
        <label htmlFor="categoryName" className={`block text-sm font-medium ${theme.card.text}`}>
          Category Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="categoryName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={50}
          className={`mt-1 block w-full px-3 py-2 ${theme.input.bg} ${theme.input.border} ${theme.card.rounded} shadow-sm ${theme.input.focusRing} text-sm sm:text-base ${theme.input.text} ${theme.input.placeholderText}`}
        />
      </div>
      <div>
        <label htmlFor="categoryDescription" className={`block text-sm font-medium ${theme.card.text}`}>
          Description (Optional)
        </label>
        <textarea
          id="categoryDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={300}
          className={`mt-1 block w-full px-3 py-2 ${theme.input.bg} ${theme.input.border} ${theme.card.rounded} shadow-sm ${theme.input.focusRing} text-sm sm:text-base ${theme.input.text} ${theme.input.placeholderText}`}
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={`w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 ${theme.button.secondary} ${theme.button.secondaryText} ${theme.card.rounded} transition disabled:opacity-50 text-sm sm:text-base`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full sm:w-auto px-4 py-2 ${theme.button.primary} ${theme.button.primaryText} ${theme.card.rounded} transition disabled:opacity-50 text-sm sm:text-base`}
        >
          {isLoading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Category' : 'Create Category')}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
