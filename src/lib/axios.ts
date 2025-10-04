import Axios, { type AxiosResponse, AxiosError } from "axios";
import { API_CONFIG } from "../consts/endpoint";

const baseURL = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`;

const api = Axios.create({
  baseURL,
  withCredentials: true,
  timeout: API_CONFIG.TIMEOUT,
});

// API Response format from server
export interface ServerApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    page_size?: number;
    pages?: number;
    next?: string;
    previous?: string;
    [key: string]: unknown;
  };
}

export interface ApiError {
  statusCode: number;
  success: false;
  message: string;
  error: string;
  data?: unknown;
}

// Generic API response wrapper with type safety
export class ApiResult<T = unknown> {
  public data: T;
  public statusCode: number;
  public isSuccess: boolean;
  public isFail: boolean;
  public message?: string;
  public error?: string;
  public meta?: {
    total?: number;
    page?: number;
    page_size?: number;
    pages?: number;
    next?: string;
    previous?: string;
    [key: string]: unknown;
  };

  constructor(response: AxiosResponse<ServerApiResponse<T>> | ApiError) {
    if ("success" in response && response.success === false) {
      this.data = (response.data || null) as T;
      this.statusCode = response.statusCode;
      this.isSuccess = false;
      this.isFail = true;
      this.message = response.message;
      this.error = response.error;
      this.meta = undefined;
    } else if ("statusCode" in response) {
      this.data = (response.data || null) as T;
      this.statusCode = response.statusCode;
      this.isSuccess = false;
      this.isFail = true;
      this.message = response.message;
      this.error = response.error;
      this.meta = undefined;
    } else {
      const axiosResponse = response as AxiosResponse<ServerApiResponse<T>>;
      const serverResponse = axiosResponse.data;

      this.data = serverResponse.data;
      this.statusCode = axiosResponse.status;
      this.isSuccess =
        serverResponse.success &&
        axiosResponse.status >= 200 &&
        axiosResponse.status < 300;
      this.isFail = !this.isSuccess;
      this.message = serverResponse.message || axiosResponse.statusText;
      this.error = serverResponse.error;
      this.meta = serverResponse.meta;
    }
  }

  getData(): T {
    return this.data;
  }
}

api.interceptors.request.use(
  async (config) => {
    try {
      if (typeof window !== "undefined") {
        const clerk = (window as unknown as Record<string, unknown>).Clerk;
        const token = await (
          clerk as { session?: { getToken?: () => Promise<string> } }
        )?.session?.getToken?.();
        if (token) {
          config.headers = config.headers ?? {};
          (config.headers as Record<string, string>)[
            "Authorization"
          ] = `Bearer ${token}`;
        }
      }
    } catch {
      // Silently ignore token errors; request proceeds without auth header
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      statusCode: error.response?.status || 500,
      success: false,
      message: error.response?.statusText || error.message || "Unknown error",
      error: error.message,
      data: error.response?.data,
    };

    // Return a rejected promise with our custom error format
    return Promise.reject(apiError);
  }
);

// HTTP Methods with type safety and token support
export const httpClient = {
  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    token?: string
  ): Promise<ApiResult<T>> {
    try {
      const fullEndpoint = endpoint;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.get<ServerApiResponse<T>>(fullEndpoint, {
        params,
        headers,
      });
      return new ApiResult<T>(response);
    } catch (error) {
      return new ApiResult<T>(error as ApiError);
    }
  },

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    token?: string
  ): Promise<ApiResult<T>> {
    try {
      const fullEndpoint = endpoint;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.post<ServerApiResponse<T>>(
        fullEndpoint,
        data,
        { headers }
      );
      return new ApiResult<T>(response);
    } catch (error) {
      return new ApiResult<T>(error as ApiError);
    }
  },

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    token?: string
  ): Promise<ApiResult<T>> {
    try {
      const fullEndpoint = endpoint;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.put<ServerApiResponse<T>>(fullEndpoint, data, {
        headers,
      });
      return new ApiResult<T>(response);
    } catch (error) {
      return new ApiResult<T>(error as ApiError);
    }
  },

  async delete<T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    token?: string
  ): Promise<ApiResult<T>> {
    try {
      const fullEndpoint = endpoint;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.delete<ServerApiResponse<T>>(fullEndpoint, {
        params,
        headers,
      });
      return new ApiResult<T>(response);
    } catch (error) {
      return new ApiResult<T>(error as ApiError);
    }
  },
};

export default api;
