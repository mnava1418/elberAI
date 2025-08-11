
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

function validateResponse<T>(response: AxiosResponse<T>): T {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  } else {
    throw new Error(`Error en la respuesta: ${response.status}`);
  }
}

function withContentType(config?: AxiosRequestConfig): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...(config?.headers || {})
    }
  };
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axios.get<T>(url, withContentType(config));
    return validateResponse(response);
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message || 'Error en GET');
  }
}

export async function apiPost<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axios.post<T>(url, data, withContentType(config));
    return validateResponse(response);
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message || 'Error en POST');
  }
}

export async function apiPut<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axios.put<T>(url, data, withContentType(config));
    return validateResponse(response);
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message || 'Error en PUT');
  }
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axios.delete<T>(url, withContentType(config));
    return validateResponse(response);
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message || 'Error en DELETE');
  }
}
