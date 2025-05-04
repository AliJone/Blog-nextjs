/**
 * Format a date string for display
 */
export function formatDate(dateString: string): string {
  // Simple date formatting with error handling
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    // Simple formatting using built-in methods
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (err) {
    console.error('Error formatting date:', err);
    return 'Invalid date';
  }
}

/**
 * Format a date with time
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (err) {
    console.error('Error formatting date with time:', err);
    return 'Invalid date';
  }
}

export function getAvatarUrl(avatar_url?: string | null, identifier?: string): string {
  // If a valid avatar URL is provided, use it
  if (avatar_url) return avatar_url;
  
  // Get initial and background color
  const initial = identifier ? identifier.charAt(0).toUpperCase() : 'U';
  const bgColor = '#00000';
  const textColor = '#ffffff';


  // Disclaimer: Had so stackoverflow for this one probably a better way to do this but I landed on this
  // Create an SVG data URL - this avoids Next.js Image optimization issues
  // Encode special characters for safe data URL usage
  const svgContent = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="50" fill="${bgColor}" />
    <text x="50" y="62" font-family="Arial, sans-serif" font-size="45" font-weight="bold" fill="${textColor}" text-anchor="middle">${initial}</text>
  </svg>`);
  
  return `data:image/svg+xml;charset=utf-8,${svgContent}`;
}