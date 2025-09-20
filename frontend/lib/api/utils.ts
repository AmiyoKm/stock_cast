const API_BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:8080/v1"
    : process.env.API_BASE_URL;
const REALTIME_API_BASE_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:4000/v1/dse"
    : process.env.REALTIME_API_BASE_URL;

export async function fetchAPI<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
}

export async function fetchRealTimeAPI<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${REALTIME_API_BASE_URL}${endpoint}`)
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return response.json()
}
export async function postAPI<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
}
