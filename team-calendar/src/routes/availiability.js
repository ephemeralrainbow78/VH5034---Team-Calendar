import { notifySessionExpired } from "./auth"

export const GetAvailability = async (token) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/availiability`, {
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

export const CreateAvailability = async (token, availability) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/availiability`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(availability)
    })
    notifySessionExpired(token, response)
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.detail || `HTTP Error: ${response.status}`)
    }
    return data
}