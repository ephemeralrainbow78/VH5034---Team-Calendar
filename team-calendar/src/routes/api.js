export const API_BASE_URL = (
    import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "")

export const readJsonResponse = async (response) => {
    const body = await response.text()
    if (!body.trim()) {
        throw new Error(
            `The API returned an empty response for ${response.url || "the request"} (HTTP ${response.status}).`
        )
    }

    let data
    try {
        data = JSON.parse(body)
    } catch {
        throw new Error(
            `The API returned invalid JSON for ${response.url || "the request"} (HTTP ${response.status}).`
        )
    }

    if (!response.ok) {
        const detail = data && typeof data === "object" ? data.detail : null
        throw new Error(detail || `HTTP Error: ${response.status}`)
    }

    return data
}
