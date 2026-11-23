import { notifySessionExpired } from "./auth"

export const GetUsers = async (token) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    })
    notifySessionExpired(token, response)
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.detail || `HTTP Error: ${response.status}`)
    }
    return data
}