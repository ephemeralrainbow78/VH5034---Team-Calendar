import { notifySessionExpired } from "./auth"
import { API_BASE_URL, readJsonResponse } from "./api"

export const GetUsers = async (token) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    })
    notifySessionExpired(token, response)
    return readJsonResponse(response)
}