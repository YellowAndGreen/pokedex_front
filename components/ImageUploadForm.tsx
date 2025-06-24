import React, { useState } from 'react';
import type { BodyUploadImage, ApiError } from '../types';
import ErrorDisplay from './ErrorDisplay';
import { UploadIcon } from './icons';
import { useTheme } from '../contexts/ThemeContext';

interface ImageUploadFormProps {
  categoryId: string;
  onSubmit: (data: BodyUploadImage) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: ApiError | string | null;
}

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({
  categoryId,
  onSubmit,
  onCancel,
  isLoading,
  error,
}) => {
  const { theme } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [setAsThumbnail, setSetAsThumbnail] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      } // Clean up previous preview
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      // Consider using a more integrated error display instead of alert
      setFormErrorState({ message: 'Please select an image file.' });
      return;
    }
    const formData: BodyUploadImage = {
      file,
      category_id: categoryId,
      title: title || null,
      description: description || null,
      tags: tags || null,
      set_as_category_thumbnail: setAsThumbnail,
    };
    await onSubmit(formData);
  };

  // For local form validation errors, not API errors
  const [formErrorState, setFormErrorState] = useState<ApiError | null>(null);

  return (
    <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6'>
      {error && <ErrorDisplay error={error} />}
      {formErrorState && <ErrorDisplay error={formErrorState} />}
      <div>
        <label htmlFor='imageFile' className={`block text-sm font-medium ${theme.card.text}`}>
          Image File <span className='text-red-500'>*</span>
        </label>
        <div
          className={`mt-1 flex flex-col items-center justify-center px-3 sm:px-6 pt-4 pb-4 sm:pt-5 sm:pb-6 border-2 ${theme.input.border.replace('border-', 'border-dashed border-')} ${theme.card.rounded}`}
        >
          <div className='space-y-1 text-center'>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt='Preview'
                className='mx-auto h-24 sm:h-32 w-auto object-contain rounded-md mb-2'
              />
            ) : (
              <UploadIcon
                className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 ${theme.card.secondaryText}`}
              />
            )}
            <div
              className={`flex flex-col sm:flex-row text-xs sm:text-sm ${theme.card.secondaryText}`}
            >
              <label
                htmlFor='imageFile'
                className={`relative cursor-pointer ${theme.input.bg} ${theme.card.rounded} font-medium ${theme.brandColor} hover:text-opacity-80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 ${theme.input.focusRing.replace('focus:border-', 'focus-within:ring-offset-')}`}
              >
                <span>Upload a file</span>
                <input
                  id='imageFile'
                  name='imageFile'
                  type='file'
                  className='sr-only'
                  onChange={handleFileChange}
                  accept='image/*'
                  required
                />
              </label>
              <p className='pl-0 sm:pl-1 mt-1 sm:mt-0'>or drag and drop</p>
            </div>
            <p className={`text-xs ${theme.card.secondaryText} opacity-75`}>
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
        {file && (
          <p className={`text-xs sm:text-sm ${theme.card.secondaryText} mt-1`}>
            Selected: {file.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor='imageTitle' className={`block text-sm font-medium ${theme.card.text}`}>
          Title (Optional)
        </label>
        <input
          type='text'
          id='imageTitle'
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={255}
          className={`mt-1 block w-full px-3 py-2 ${theme.input.bg} ${theme.input.border} ${theme.card.rounded} shadow-sm ${theme.input.focusRing} text-sm sm:text-base ${theme.input.text} ${theme.input.placeholderText}`}
        />
      </div>

      <div>
        <label
          htmlFor='imageDescription'
          className={`block text-sm font-medium ${theme.card.text}`}
        >
          Description (Optional)
        </label>
        <textarea
          id='imageDescription'
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          className={`mt-1 block w-full px-3 py-2 ${theme.input.bg} ${theme.input.border} ${theme.card.rounded} shadow-sm ${theme.input.focusRing} text-sm sm:text-base ${theme.input.text} ${theme.input.placeholderText}`}
        />
      </div>

      <div>
        <label htmlFor='imageTags' className={`block text-sm font-medium ${theme.card.text}`}>
          Tags (Optional, comma-separated)
        </label>
        <input
          type='text'
          id='imageTags'
          value={tags}
          onChange={e => setTags(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 ${theme.input.bg} ${theme.input.border} ${theme.card.rounded} shadow-sm ${theme.input.focusRing} text-sm sm:text-base ${theme.input.text} ${theme.input.placeholderText}`}
        />
      </div>

      <div className='flex items-center'>
        <input
          id='setAsThumbnail'
          type='checkbox'
          checked={setAsThumbnail}
          onChange={e => setSetAsThumbnail(e.target.checked)}
          className={`h-4 w-4 ${theme.brandColor.replace('text-', 'accent-')} ${theme.input.border} rounded focus:ring-opacity-50 ${theme.input.focusRing.replace('focus:border-', 'focus:ring-')}`}
        />
        <label htmlFor='setAsThumbnail' className={`ml-2 block text-sm ${theme.card.text}`}>
          Set as category thumbnail
        </label>
      </div>

      <div className='flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 pt-2'>
        <button
          type='button'
          onClick={onCancel}
          disabled={isLoading}
          className={`w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 ${theme.button.secondary} ${theme.button.secondaryText} ${theme.card.rounded} transition disabled:opacity-50 text-sm sm:text-base`}
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={isLoading || !file}
          className={`w-full sm:w-auto px-4 py-2 ${theme.button.primary} ${theme.button.primaryText} ${theme.card.rounded} transition disabled:opacity-50 text-sm sm:text-base`}
        >
          {isLoading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
    </form>
  );
};

export default ImageUploadForm;
