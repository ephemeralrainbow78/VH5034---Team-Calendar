import { useEffect, useState } from "react"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material"
import { GetCategories } from "../routes/categories"
import { CreateAvailability } from "../routes/availiability"

const EMPTY_FORM = {
    user_id: '',
    category_id: '',
    start_date: '',
    end_date: '',
    notes: ''
}

const getInitialForm = (currentUser) => ({
    ...EMPTY_FORM,
    user_id: ['admin', 'manager'].includes(currentUser?.role?.toLowerCase()) ? '' : currentUser?.id || ''
})

export const AddAbsenceDialog = ({ open, onClose, onCreated, staff, currentUser, token }) => {
    const [categories, setCategories] = useState([])
    const [form, setForm] = useState(() => getInitialForm(currentUser))
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const role = currentUser?.role?.toLowerCase()
    const isAdmin = role === 'admin'
    const isManager = role === 'manager'
    const eligibleStaff = staff.filter((user) => (
        user.is_active && (
            isAdmin ||
            (isManager
                ? Boolean(currentUser.team_id) && user.team_id === currentUser.team_id
                : user.id === currentUser?.id)
        )
    ))

    useEffect(() => {
        if (!open) return undefined

        let active = true
        GetCategories()
            .then((categoryList) => {
                if (active) setCategories(categoryList)
            })
            .catch((requestError) => {
                if (active) setError(`Could not load absence types: ${requestError.message}`)
            })

        return () => {
            active = false
        }
    }, [open])

    const handleClose = () => {
        setForm(getInitialForm(currentUser))
        setError('')
        onClose()
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (form.end_date < form.start_date) {
            setError('End date must be on or after the start date.')
            return
        }

        const selectedUser = eligibleStaff.find((user) => user.id === form.user_id)
        if (!selectedUser) {
            setError('Select an eligible staff member.')
            return
        }
        setError('')
        setSaving(true)
        try {
            await CreateAvailability(token, {
                ...form,
                notes: form.notes.trim() || null,
                team_id: selectedUser?.team_id || null
            })
            onCreated()
            handleClose()
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onClose={saving ? undefined : handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Add absence</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {error && <Alert severity="error">{error}</Alert>}
                        {(isAdmin || isManager) && eligibleStaff.length === 0 && (
                            <Alert severity="warning">No active staff members are available to add an absence for.</Alert>
                        )}
                        <TextField
                            select
                            required
                            label="Staff member"
                            value={form.user_id}
                            onChange={(event) => setForm({ ...form, user_id: event.target.value })}
                            disabled={!isAdmin && !isManager}
                            fullWidth
                        >
                            {eligibleStaff.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            required
                            label="Absence type"
                            value={form.category_id}
                            onChange={(event) => setForm({ ...form, category_id: event.target.value })}
                            disabled={categories.length === 0}
                            fullWidth
                        >
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                required
                                type="date"
                                label="Start date"
                                value={form.start_date}
                                onChange={(event) => setForm({ ...form, start_date: event.target.value })}
                                slotProps={{ inputLabel: { shrink: true } }}
                                fullWidth
                            />
                            <TextField
                                required
                                type="date"
                                label="End date"
                                value={form.end_date}
                                onChange={(event) => setForm({ ...form, end_date: event.target.value })}
                                slotProps={{ inputLabel: { shrink: true } }}
                                fullWidth
                            />
                        </Stack>
                        <TextField
                            label="Notes"
                            value={form.notes}
                            onChange={(event) => setForm({ ...form, notes: event.target.value })}
                            multiline
                            minRows={2}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose} disabled={saving}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={saving || categories.length === 0 || eligibleStaff.length === 0}>
                        {saving ? 'Saving...' : 'Add absence'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
