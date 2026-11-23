import { useState } from "react"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material"
import { CreateCategory } from "../routes/categories"

const EMPTY_FORM = {
    name: "",
    code: "",
    colour: "#EDE7F9"
}

export const AddCategoryDialog = ({ open, onClose, onCreated, token }) => {
    const [form, setForm] = useState(EMPTY_FORM)
    const [error, setError] = useState("")
    const [saving, setSaving] = useState(false)

    const handleClose = () => {
        if (saving) return
        setForm(EMPTY_FORM)
        setError("")
        onClose()
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        const name = form.name.trim()
        const code = form.code.trim().toUpperCase()
        if (!name || !code) {
            setError("Enter a category name and short code.")
            return
        }

        setSaving(true)
        setError("")
        try {
            const category = await CreateCategory(token, {
                name,
                code,
                colour: form.colour
            })
            setForm(EMPTY_FORM)
            onCreated(category)
            onClose()
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onClose={saving ? undefined : handleClose} fullWidth maxWidth="sm">
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add absence category</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        <TextField
                            autoFocus
                            required
                            fullWidth
                            label="Category name"
                            value={form.name}
                            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                            inputProps={{ maxLength: 100 }}
                        />
                        <TextField
                            required
                            fullWidth
                            label="Calendar marker"
                            value={form.code}
                            onChange={(event) => setForm((current) => ({
                                ...current,
                                code: event.target.value.toUpperCase()
                            }))}
                            helperText="Short code shown in calendar cells (up to 5 characters)."
                            inputProps={{ maxLength: 5 }}
                        />
                        <TextField
                            required
                            fullWidth
                            type="color"
                            label="Category colour"
                            value={form.colour}
                            onChange={(event) => setForm((current) => ({ ...current, colour: event.target.value }))}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose} disabled={saving}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={saving || !form.name.trim() || !form.code.trim()}>
                        {saving ? "Creating..." : "Create category"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
