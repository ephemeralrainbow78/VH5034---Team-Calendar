export const GetTeams = async () => {
    try{
        const response = await fetch(`${import.meta.env.VITE_API_URL}/teams`, { method: "GET", credentials: "include" })
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`)
        }
        const data = await response.json()
        console.log(data)
        return data
    } catch (error) {
        console.error(error)
        throw error
    }
}