export const Login = async (loginData) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData)
        })
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`)
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
    }
}