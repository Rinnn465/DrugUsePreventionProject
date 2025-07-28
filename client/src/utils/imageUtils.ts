/**
 * Utility functions for handling image URLs and display
 */

// Base server URL - có thể config từ environment
const SERVER_BASE_URL = 'http://localhost:5000';

/**
 * Convert relative image path to full URL
 * @param imagePath - Image path from database (could be relative or absolute)
 * @returns Full image URL
 */
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  
  // Nếu đã là URL đầy đủ (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Nếu path bắt đầu với /, thêm base URL
  if (imagePath.startsWith('/')) {
    return `${SERVER_BASE_URL}${imagePath}`;
  }
  
  // Nếu path không bắt đầu với /, thêm base URL + /
  return `${SERVER_BASE_URL}/${imagePath}`;
};

/**
 * Get initials from full name for avatar fallback
 * @param fullName - User's full name
 * @returns Initials (max 2 characters)
 */
export const getInitials = (fullName: string | null | undefined): string => {
  if (!fullName) return 'AD';
  
  const names = fullName.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
};

/**
 * Generate a consistent color for user avatar based on name
 * @param fullName - User's full name
 * @returns CSS color classes for background and text
 */
export const getAvatarColor = (fullName: string | null | undefined): { bg: string; text: string } => {
  if (!fullName) return { bg: 'bg-blue-100', text: 'text-blue-600' };
  
  const colors = [
    { bg: 'bg-blue-100', text: 'text-blue-600' },
    { bg: 'bg-green-100', text: 'text-green-600' },
    { bg: 'bg-purple-100', text: 'text-purple-600' },
    { bg: 'bg-orange-100', text: 'text-orange-600' },
    { bg: 'bg-pink-100', text: 'text-pink-600' },
    { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  ];
  
  // Use string length for simple color selection
  const index = fullName.length % colors.length;
  return colors[index];
};

/**
 * Resize image canvas for optimal display
 * @param file - Image file
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @param quality - JPEG quality (0-1)
 * @returns Promise<Blob> - Resized image blob
 */
export const resizeImage = (
  file: File, 
  maxWidth: number = 300, 
  maxHeight: number = 300, 
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Cannot get canvas context'));
      return;
    }
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate image file type and size
 * @param file - File to validate
 * @param maxSize - Maximum size in bytes (default 10MB)
 * @returns Validation result
 */
export const validateImageFile = (file: File, maxSize: number = 10 * 1024 * 1024): { valid: boolean; error?: string } => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Chỉ cho phép các định dạng ảnh JPEG, PNG, GIF.' };
  }
  
  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return { valid: false, error: `Kích thước file không được vượt quá ${maxSizeMB}MB` };
  }
  
  return { valid: true };
};
