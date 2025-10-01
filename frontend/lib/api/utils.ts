
import axiosInstance, { realtimeAxiosInstance } from "../utils/axios";

export async function fetchAPI<T>(endpoint: string): Promise<T> {
    const response = await axiosInstance.get(endpoint);
    return response.data;
}

export async function fetchRealTimeAPI<T>(endpoint: string): Promise<T> {
    const response = await realtimeAxiosInstance.get(endpoint);
    return response.data;
}

export async function postAPI<T>(endpoint: string, data: any): Promise<T> {
    const response = await axiosInstance.post(endpoint, data);
    return response.data;
}

export async function deleteAPI<T>(endpoint: string, data: any): Promise<T> {
    const response = await axiosInstance.delete(endpoint, { data: data });
    return response.data;
}
