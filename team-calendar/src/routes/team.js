import { API_BASE_URL, readJsonResponse } from "./api"
import { notifySessionExpired } from "./auth"

export const GetTeams = async () => {
    try{
        const response = await fetch(`${API_BASE_URL}/teams`, { method: "GET", credentials: "include" })
        const data = await readJsonResponse(response)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}

export const CreateTeam = async (token, team) => {
    const response = await fetch(`${API_BASE_URL}/teams`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(team)
    })
    notifySessionExpired(token, response)
    return readJsonResponse(response)
}

export const UpdateTeam = async (token, teamId, team) => {
    const response = await fetch(`${API_BASE_URL}/teams/${encodeURIComponent(teamId)}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(team)
    })
    notifySessionExpired(token, response)
    return readJsonResponse(response)
}

export const DeleteTeam = async (token, teamId) => {
    const response = await fetch(`${API_BASE_URL}/teams/${encodeURIComponent(teamId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    })
    notifySessionExpired(token, response)
    if (response.status === 204) return
    return readJsonResponse(response)
}