import { FC } from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  fullPage?: boolean;
  text?: string;
  centered?: boolean;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  className = '',
  fullPage = false,
  text,
  centered = false
}) => {
  // Size classes
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3',
  };

  const spinnerClasses = `inline-block animate-spin rounded-full border-solid border-blue-600 border-r-transparent ${sizeClasses[size]} ${className}`;

  // Component with loading text
  const spinnerWithText = text ? (
    <div className="flex items-center justify-center">
      <div className={spinnerClasses}></div>
      <p className="ml-3 text-gray-600">{text}</p>
    </div>
  ) : (
    <div className={spinnerClasses}></div>
  );

  // Full page loading
  if (fullPage) {
    return (
      <div className="flex h-full min-h-[200px] w-full items-center justify-center">
        {spinnerWithText}
      </div>
    );
  }

  // Centered in parent container
  if (centered) {
    return (
      <div className="flex h-40 items-center justify-center">
        {spinnerWithText}
      </div>
    );
  }

  // Just the spinner (with optional text)
  return spinnerWithText;
};

export default LoadingSpinner;