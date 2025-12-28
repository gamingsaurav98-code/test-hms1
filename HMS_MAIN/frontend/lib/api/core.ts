// API Core utilities and configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com/api' 
  : (process.env.DOCKER_ENV === 'true' ? 'http://backend:8000/api' : 'http://localhost:8000/api');

// Default fetch options for API calls
export const defaultFetchOptions: RequestInit = {
  credentials: 'include',
  mode: 'cors',
  headers: {
    'Accept': 'application/json',
  },
};

// Helper function to make API calls with default options
export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...defaultFetchOptions,
    ...options,
    headers: {
      ...defaultFetchOptions.headers,
      ...options.headers,
    },
  });
}

// Generic API Error class
export class ApiError extends Error {
  public status: number;
  public message: string;
  public validation: any;  // Changed from validationErrors to validation

  constructor(status: number, message: string, validation: any) {
    super(message);
    this.status = status;
    this.message = message;
    this.validation = validation;  // Changed from this.validationErrors = validationErrors
  }
}

// Generic response handler
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let validation: Record<string, string[]> | undefined;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      validation = errorData.errors;
    } catch (e) {
      // If we can't parse the error response, use the default message
    }

    throw new ApiError(response.status, errorMessage, validation);
  }

  try {
    const responseData = await response.json();
    return responseData as T;
  } catch (e) {
    const error = e as Error;
    throw new ApiError(response.status, `Failed to parse response: ${error.message}`, undefined);
  }
}

// Pagination response interface
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Generic pagination parameters
export interface PaginationParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}
