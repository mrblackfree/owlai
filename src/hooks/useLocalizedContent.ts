import { useTranslation } from 'react-i18next';
import { getCategoryTranslation, getTagTranslation } from '@/lib/schemas/tool.schema';

/**
 * Hook for getting localized content from API data
 */
export function useLocalizedContent() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as 'ko' | 'en';

  /**
   * Get localized field value from an object
   */
  const getLocalizedField = <T extends Record<string, any>>(
    obj: T,
    field: keyof T
  ): any => {
    if (!obj) return '';
    
    const koField = `${String(field)}_ko` as keyof T;
    
    // If Korean and Korean field exists, use it
    if (currentLang === 'ko' && obj[koField]) {
      return obj[koField];
    }
    
    // Otherwise use the original field
    return obj[field];
  };

  /**
   * Get localized category
   */
  const getCategory = (category: string): string => {
    return getCategoryTranslation(category, currentLang);
  };

  /**
   * Get localized tag
   */
  const getTag = (tag: string): string => {
    return getTagTranslation(tag, currentLang);
  };

  /**
   * Get localized tags array
   */
  const getTags = (tags: string[] | undefined): string[] => {
    if (!tags) return [];
    return tags.map(tag => getTag(tag));
  };

  return {
    getLocalizedField,
    getCategory,
    getTag,
    getTags,
    currentLang
  };
}

