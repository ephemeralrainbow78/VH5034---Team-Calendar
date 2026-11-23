import { API_BASE_URL, readJsonResponse } from "./api"

export const notifySessionExpired = (token, response) => {
    if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('team-calendar:session-expired', {
            detail: { token }
        }))
    }
}

export const Login = async (loginData) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
    })
    return readJsonResponse(response)
}

export const GetCurrentUser = async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/account`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    notifySessionExpired(token, response)
    return readJsonResponse(response)
}

export const Signup = async (signupData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(signupData)
        })
        return await readJsonResponse(response)
    } catch (error) {
        console.error("Signup error", error)
        throw error
    }
}