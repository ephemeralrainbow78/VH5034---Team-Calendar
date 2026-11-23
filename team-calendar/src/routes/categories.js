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