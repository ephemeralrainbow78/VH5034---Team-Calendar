export const notifySessionExpired = (token, response) => {
    if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('team-calendar:session-expired', {
            detail: { token }
        }))
    }
}

export const Login = async (loginData) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
    })
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.detail || `HTTP Error: ${response.status}`)
    }
    return data
}

export const GetCurrentUser = async (token) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/account`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    notifySessionExpired(token, response)
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.detail || `HTTP Error: ${response.status}`)
    }
    return data
}

export const Signup = async (signupData) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(signupData)
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.detail || `HTTP Error: ${response.status}`)
        }
        return data
    } catch (error) {
        console.error("Signup error", error)
        throw error
    }
}