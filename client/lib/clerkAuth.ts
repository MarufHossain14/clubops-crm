/**
 * Get Clerk authentication token for API requests
 * This is used by RTK Query to add auth tokens to requests
 * Uses Next.js API route to get token from server-side Clerk auth
 */
export const getClerkToken = async (): Promise<string | null> => {
  // Only run on client-side
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Fetch token from our Next.js API route (which uses server-side Clerk auth)
    const response = await fetch('/api/auth-token', {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.token || null;
    }

    return null;
  } catch (error) {
    // Silently fail - token might not be available
    return null;
  }
};

