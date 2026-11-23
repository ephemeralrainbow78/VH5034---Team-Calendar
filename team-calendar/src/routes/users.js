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

export const MoveUserToTeam = async (token, userId, teamId) => {
    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}/team`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ team_id: teamId })
    })
    notifySessionExpired(token, response)
    return readJsonResponse(response)
}