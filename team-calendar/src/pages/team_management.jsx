import { useEffect, useMemo, useState } from "react"
import {
    Add,
    AccountCircle,
    ArrowBack,
    Delete,
    Edit,
    Groups,
    Logout,
    People,
    Search,
    SwapHoriz
} from "@mui/icons-material"
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import { CreateTeam, DeleteTeam, GetTeams, UpdateTeam } from "../routes/team"
import { GetUsers, MoveUserToTeam } from "../routes/users"

const EMPTY_FORM = { name: "", description: "" }

const formatDate = (value) => {
    if (!value) return "—"
    const date = new Date(value)
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date)
}

export const TeamManagementPage = ({ token, currentUser, onLogout }) => {
    const navigate = useNavigate()
    const [teams, setTeams] = useState([])
    const [staff, setStaff] = useState([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [editingTeam, setEditingTeam] = useState(null)
    const [deleteTargetTeam, setDeleteTargetTeam] = useState(null)
    const [deleteError, setDeleteError] = useState("")
    const [deleting, setDeleting] = useState(false)
    const [moveDialogTeam, setMoveDialogTeam] = useState(null)
    const [moveForm, setMoveForm] = useState({ userId: "", teamId: "" })
    const [moveError, setMoveError] = useState("")
    const [moving, setMoving] = useState(false)

    useEffect(() => {
        let active = true
        Promise.all([GetTeams(), GetUsers(token)])
            .then(([teamList, staffList]) => {
                if (!active) return
                setTeams(teamList)
                setStaff(staffList)
                setError("")
            })
            .catch((requestError) => {
                if (active) setError(`Could not load team information: ${requestError.message}`)
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [token])

    const activeStaff = useMemo(() => staff.filter((user) => user.is_active), [staff])
    const staffByTeam = useMemo(() => {
        const counts = new Map()
        activeStaff.forEach((user) => {
            if (user.team_id) counts.set(user.team_id, (counts.get(user.team_id) || 0) + 1)
        })
        return counts
    }, [activeStaff])
    const membersByTeam = useMemo(() => {
        const counts = new Map()
        staff.forEach((user) => {
            if (user.team_id) counts.set(user.team_id, (counts.get(user.team_id) || 0) + 1)
        })
        return counts
    }, [staff])
    const moveableStaff = useMemo(() => (
        moveDialogTeam
            ? activeStaff.filter((user) => user.team_id === moveDialogTeam.id)
            : []
    ), [activeStaff, moveDialogTeam])

    const visibleTeams = teams.filter((team) => (
        `${team.name} ${team.description || ""}`.toLowerCase().includes(search.trim().toLowerCase())
    ))

    const closeDialog = () => {
        if (saving) return
        setDialogOpen(false)
        setForm(EMPTY_FORM)
        setEditingTeam(null)
        setError("")
    }

    const openCreateDialog = () => {
        setEditingTeam(null)
        setForm(EMPTY_FORM)
        setError("")
        setDialogOpen(true)
    }

    const openEditDialog = (team) => {
        setEditingTeam(team)
        setForm({ name: team.name, description: team.description || "" })
        setError("")
        setDialogOpen(true)
    }

    const handleSaveTeam = async (event) => {
        event.preventDefault()
        const name = form.name.trim()
        if (!name) {
            setError("Enter a team name.")
            return
        }

        setSaving(true)
        setError("")
        setSuccess("")
        try {
            const payload = {
                name,
                description: form.description.trim() || null
            }
            if (editingTeam) {
                const updatedTeam = await UpdateTeam(token, editingTeam.id, payload)
                setTeams((currentTeams) => currentTeams.map((team) => (
                    team.id === updatedTeam.id ? updatedTeam : team
                )).sort((first, second) => (
                    first.name.localeCompare(second.name, "en", { sensitivity: "base" })
                )))
                setSuccess(`${updatedTeam.name} was updated.`)
            } else {
                const createdTeam = await CreateTeam(token, payload)
                setTeams((currentTeams) => (
                    [...currentTeams, createdTeam].sort((first, second) =>
                        first.name.localeCompare(second.name, "en", { sensitivity: "base" })
                    )
                ))
                setSuccess(`${createdTeam.name} was created.`)
            }
            setDialogOpen(false)
            setForm(EMPTY_FORM)
            setEditingTeam(null)
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setSaving(false)
        }
    }

    const closeDeleteDialog = () => {
        if (deleting) return
        setDeleteTargetTeam(null)
        setDeleteError("")
    }

    const handleDeleteTeam = async (event) => {
        event.preventDefault()
        if (!deleteTargetTeam) return

        setDeleting(true)
        setDeleteError("")
        setError("")
        setSuccess("")
        try {
            await DeleteTeam(token, deleteTargetTeam.id)
            setTeams((currentTeams) => currentTeams.filter((team) => team.id !== deleteTargetTeam.id))
            setSuccess(`${deleteTargetTeam.name} was deleted.`)
            setDeleteTargetTeam(null)
        } catch (requestError) {
            setDeleteError(requestError.message)
        } finally {
            setDeleting(false)
        }
    }

    const openMoveDialog = (team) => {
        const members = activeStaff.filter((user) => user.team_id === team.id)
        setMoveDialogTeam(team)
        setMoveForm({ userId: members[0]?.id || "", teamId: "" })
        setMoveError("")
    }

    const closeMoveDialog = () => {
        if (moving) return
        setMoveDialogTeam(null)
        setMoveForm({ userId: "", teamId: "" })
        setMoveError("")
    }

    const handleMoveMember = async (event) => {
        event.preventDefault()
        if (!moveForm.userId || !moveForm.teamId) {
            setMoveError("Select a team member and destination team.")
            return
        }

        setMoving(true)
        setMoveError("")
        setError("")
        setSuccess("")
        try {
            const movedUser = await MoveUserToTeam(token, moveForm.userId, moveForm.teamId)
            setStaff((currentStaff) => currentStaff.map((user) => (
                user.id === movedUser.id ? movedUser : user
            )))
            setSuccess(`${movedUser.first_name} ${movedUser.last_name} moved to ${movedUser.team}.`)
            setMoveDialogTeam(null)
            setMoveForm({ userId: "", teamId: "" })
        } catch (requestError) {
            setMoveError(requestError.message)
        } finally {
            setMoving(false)
        }
    }

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: { xs: 3, md: 5 } }}>
            <Container maxWidth="lg">
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 4 }}
                >
                    <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                            Team Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            View teams and manage team records. Signed in as {currentUser.first_name} {currentUser.last_name}.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<AccountCircle />}
                            onClick={() => navigate("/account")}
                            sx={{ borderColor: "#d8d7d3", color: "text.primary" }}
                        >
                            My Account
                        </Button>
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<ArrowBack />}
                            onClick={() => navigate("/calendar")}
                            sx={{ borderColor: "#d8d7d3", color: "text.primary" }}
                        >
                            Calendar
                        </Button>
                        <Button variant="outlined" color="inherit" startIcon={<Logout />} onClick={onLogout} sx={{ borderColor: "#d8d7d3", color: "text.primary" }}>
                            Log Out
                        </Button>
                    </Stack>
                </Stack>

                {error && !dialogOpen && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
                    <Paper variant="outlined" sx={{ flex: 1, p: 2.5, borderColor: "divider" }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                            <Groups color="action" />
                            <Box>
                                <Typography variant="body2" color="text.secondary">Teams</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>{teams.length}</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                    <Paper variant="outlined" sx={{ flex: 1, p: 2.5, borderColor: "divider" }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                            <People color="action" />
                            <Box>
                                <Typography variant="body2" color="text.secondary">Active staff</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>{activeStaff.length}</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Stack>

                <Paper variant="outlined" sx={{ borderColor: "divider" }}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, p: { xs: 2, md: 3 } }}
                    >
                        <Box>
                            <Typography variant="h6">Teams</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {teams.length} team{teams.length === 1 ? "" : "s"} in your organisation
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                            <TextField
                                size="small"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search teams"
                                inputProps={{ "aria-label": "Search teams" }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search fontSize="small" />
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                            <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>
                                Add Team
                            </Button>
                        </Stack>
                    </Stack>
                    <Divider />
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
                            <CircularProgress size={28} aria-label="Loading teams" />
                        </Box>
                    ) : visibleTeams.length === 0 ? (
                        <Typography color="text.secondary" sx={{ p: 4, textAlign: "center" }}>
                            {teams.length === 0 ? "No teams have been created yet." : "No teams match your search."}
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table aria-label="Teams">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Team</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="center">Active staff</TableCell>
                                        <TableCell>Created</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {visibleTeams.map((team) => (
                                        <TableRow key={team.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{team.name}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color={team.description ? "text.primary" : "text.secondary"}>
                                                    {team.description || "No description"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip size="small" label={staffByTeam.get(team.id) || 0} />
                                            </TableCell>
                                            <TableCell>{formatDate(team.created_at)}</TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                                                    <Tooltip title="Edit team">
                                                        <IconButton size="small" aria-label={`Edit ${team.name}`} onClick={() => openEditDialog(team)}>
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={membersByTeam.get(team.id) ? "Move all team members before deleting" : "Delete team"}>
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                aria-label={`Delete ${team.name}`}
                                                                disabled={Boolean(membersByTeam.get(team.id))}
                                                                onClick={() => {
                                                                    setDeleteTargetTeam(team)
                                                                    setDeleteError("")
                                                                }}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<SwapHoriz />}
                                                        disabled={!staffByTeam.get(team.id)}
                                                        onClick={() => openMoveDialog(team)}
                                                        aria-label={`Move a member from ${team.name}`}
                                                    >
                                                        Move member
                                                    </Button>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
                    <Box component="form" onSubmit={handleSaveTeam}>
                        <DialogTitle>{editingTeam ? "Edit team" : "Add a team"}</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2.5} sx={{ pt: 1 }}>
                                {error && <Alert severity="error">{error}</Alert>}
                                <TextField
                                    autoFocus
                                    required
                                    fullWidth
                                    label="Team name"
                                    value={form.name}
                                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                    inputProps={{ maxLength: 100 }}
                                />
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    label="Description"
                                    value={form.description}
                                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                                    inputProps={{ maxLength: 500 }}
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={saving || !form.name.trim()}>
                                {saving ? "Saving..." : editingTeam ? "Save changes" : "Create team"}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                <Dialog open={Boolean(deleteTargetTeam)} onClose={closeDeleteDialog} fullWidth maxWidth="sm">
                    <Box component="form" onSubmit={handleDeleteTeam}>
                        <DialogTitle>Delete team</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2} sx={{ pt: 1 }}>
                                <Alert severity="warning">
                                    Delete {deleteTargetTeam?.name}? This cannot be undone. Teams with assigned members must be emptied first.
                                </Alert>
                                <Typography variant="body2" color="text.secondary">
                                    Any existing absence records still linked to this team will be kept and marked as unassigned.
                                </Typography>
                                {deleteError && <Alert severity="error">{deleteError}</Alert>}
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={closeDeleteDialog} disabled={deleting}>Cancel</Button>
                            <Button type="submit" color="error" variant="contained" disabled={deleting}>
                                {deleting ? "Deleting..." : "Delete team"}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                <Dialog open={Boolean(moveDialogTeam)} onClose={closeMoveDialog} fullWidth maxWidth="sm">
                    <Box component="form" onSubmit={handleMoveMember}>
                        <DialogTitle>Move a team member</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2.5} sx={{ pt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Select an active member of {moveDialogTeam?.name} and choose their new team.
                                </Typography>
                                <Alert severity="warning">
                                    Moving a member also updates the team linked to their existing absences.
                                </Alert>
                                {moveError && <Alert severity="error">{moveError}</Alert>}
                                <TextField
                                    select
                                    required
                                    fullWidth
                                    label="Team member"
                                    value={moveForm.userId}
                                    onChange={(event) => setMoveForm((current) => ({ ...current, userId: event.target.value }))}
                                >
                                    {moveableStaff.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.first_name} {user.last_name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    required
                                    fullWidth
                                    label="Move to team"
                                    value={moveForm.teamId}
                                    onChange={(event) => setMoveForm((current) => ({ ...current, teamId: event.target.value }))}
                                >
                                    {teams.filter((team) => team.id !== moveDialogTeam?.id).map((team) => (
                                        <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={closeMoveDialog} disabled={moving}>Cancel</Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={moving || !moveForm.userId || !moveForm.teamId}
                            >
                                {moving ? "Moving..." : "Move member"}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
            </Container>
        </Box>
    )
}
