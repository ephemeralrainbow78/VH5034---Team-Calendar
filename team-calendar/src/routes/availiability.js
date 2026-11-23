import { notifySessionExpired } from "./auth"
import { API_BASE_URL, readJsonResponse } from "./api"

export const GetAvailability = async (token) => {
    const response = await fetch(`${API_BASE_URL}/availiability`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    })
    notifySessionExpired(token, response)
    return readJsonResponse(response)
}

export const CreateAvailability = async (token, availability) => {
    const response = await fetch(`${API_BASE_URL}/availiability`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(availability)
    })
    notifySessionExpired(token, response)
    return readJsonResponse(response)
}