/**
 * Get the full URL for an image stored in the backend
 */
export function getImageUrl(imagePath: string | null): string {
  if (!imagePath) {
    return '/placeholder-image.jpg' // Fallback image
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath
  }

  // Backend storage URL - remove /api suffix if present
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
  const baseUrl = apiUrl.replace('/api', '')
  return `${baseUrl}/storage/${imagePath}`
}

/**
 * Format date for display (hydration-safe)
 * Uses a simple, deterministic format to avoid server/client mismatch
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    
    // Extract components using UTC to avoid timezone issues
    const year = date.getUTCFullYear()
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    const month = monthNames[date.getUTCMonth()]
    const day = date.getUTCDate()
    
    return `${month} ${day}, ${year}`
  } catch (error) {
    // Fallback for invalid dates
    return dateString
  }
}

/**
 * Handle API errors and return user-friendly messages
 */
export function getErrorMessage(error: any): string {
  if (error.message) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'An unexpected error occurred. Please try again.'
}