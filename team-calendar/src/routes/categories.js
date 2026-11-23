import { notifySessionExpired } from "./auth"
import { API_BASE_URL, readJsonResponse } from "./api"

export const GetCategories = async () => {
    try{
        const response = await fetch(`${API_BASE_URL}/categories`, { method: "GET", credentials: "include" })
        const data = await readJsonResponse(response)
        console.log(data)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const CreateCategory = async (token, category) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(category)
    })
    notifySessionExpired(token, response)
    return readJsonResponse(response)
}