import React from 'react';
import { User } from 'lucide-react';
import { getImageUrl, getInitials, getAvatarColor } from '../../utils/imageUtils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallbackIcon?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
};

const iconSizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10'
};

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  className = '',
  showFallbackIcon = true
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  
  const imageUrl = getImageUrl(src);
  const initials = getInitials(name);
  const avatarColors = getAvatarColor(name);
  
  const sizeClass = sizeClasses[size];
  const iconSizeClass = iconSizeClasses[size];
  const textSizeClass = textSizeClasses[size];
  
  // Reset error state when src changes
  React.useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [src]);
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };
  
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center overflow-hidden ${className}`}>
      {imageUrl && !imageError ? (
        <>
          <img
            src={imageUrl}
            alt={alt || `Avatar của ${name || 'User'}`}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {!imageLoaded && (
            <div className={`absolute inset-0 ${avatarColors.bg} flex items-center justify-center`}>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50"></div>
            </div>
          )}
        </>
      ) : (
        <div className={`w-full h-full ${avatarColors.bg} flex items-center justify-center`}>
          {showFallbackIcon ? (
            <User className={`${iconSizeClass} ${avatarColors.text}`} />
          ) : (
            <span className={`font-semibold ${textSizeClass} ${avatarColors.text}`}>
              {initials}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Avatar;
