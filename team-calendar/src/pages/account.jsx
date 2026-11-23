import { useState } from "react"
import { AccountCircle, ArrowBack, LockOutlined, Logout } from "@mui/icons-material"
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import { ChangePassword } from "../routes/auth"

const EMPTY_PASSWORDS = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
}

export const AccountPage = ({ token, currentUser, onLogout }) => {
    const navigate = useNavigate()
    const [passwords, setPasswords] = useState(EMPTY_PASSWORDS)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [saving, setSaving] = useState(false)

    const passwordsMatch = passwords.newPassword === passwords.confirmPassword
    const canSubmit = Boolean(
        passwords.currentPassword &&
        passwords.newPassword.length >= 12 &&
        passwordsMatch &&
        passwords.newPassword !== passwords.currentPassword
    )

    const handlePasswordChange = async (event) => {
        event.preventDefault()
        setError("")
        setSuccess("")

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("New passwords do not match.")
            return
        }
        if (passwords.newPassword === passwords.currentPassword) {
            setError("Choose a new password different from your current password.")
            return
        }

        setSaving(true)
        try {
            const result = await ChangePassword(token, {
                current_password: passwords.currentPassword,
                new_password: passwords.newPassword
            })
            setSuccess(result.message)
            setPasswords(EMPTY_PASSWORDS)
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setSaving(false)
        }
    }

    const initials = `${currentUser.first_name?.[0] || ""}${currentUser.last_name?.[0] || ""}`.toUpperCase()

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: { xs: 3, md: 5 } }}>
            <Container maxWidth="md">
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 4 }}
                >
                    <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                            My Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            View your profile and manage your sign-in password.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<ArrowBack />}
                            onClick={() => navigate("/calendar")}
                            sx={{ borderColor: "#d8d7d3", color: "text.primary" }}
                        >
                            Calendar
                        </Button>
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<Logout />}
                            onClick={onLogout}
                            sx={{ borderColor: "#d8d7d3", color: "text.primary" }}
                        >
                            Log Out
                        </Button>
                    </Stack>
                </Stack>

                <Stack spacing={3}>
                    <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderColor: "divider" }}>
                        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
                            <Avatar sx={{ width: 56, height: 56, bgcolor: "#e8eeee", color: "#53656b", fontWeight: 600 }}>
                                {initials || <AccountCircle />}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="h6">
                                    {currentUser.first_name} {currentUser.last_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    @{currentUser.username}
                                </Typography>
                            </Box>
                            <Chip label={currentUser.role} size="small" sx={{ ml: "auto", textTransform: "capitalize" }} />
                        </Stack>

                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            divider={<Box sx={{ display: { xs: "none", sm: "block" }, borderLeft: "1px solid", borderColor: "divider" }} />}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">Username</Typography>
                                <Typography variant="body1">{currentUser.username}</Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">Team</Typography>
                                <Typography variant="body1">{currentUser.team || "No team assigned"}</Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">Role</Typography>
                                <Typography variant="body1" sx={{ textTransform: "capitalize" }}>{currentUser.role}</Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, borderColor: "divider" }}>
                        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 0.5 }}>
                            <LockOutlined color="action" />
                            <Typography variant="h6">Change password</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                            Confirm your current password before choosing a new one.
                        </Typography>

                        <Box component="form" onSubmit={handlePasswordChange} noValidate>
                            <Stack spacing={2}>
                                {error && <Alert severity="error">{error}</Alert>}
                                {success && <Alert severity="success">{success}</Alert>}
                                <TextField
                                    required
                                    fullWidth
                                    type="password"
                                    label="Current password"
                                    autoComplete="current-password"
                                    value={passwords.currentPassword}
                                    onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    type="password"
                                    label="New password"
                                    autoComplete="new-password"
                                    helperText="Use at least 12 characters."
                                    value={passwords.newPassword}
                                    onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    type="password"
                                    label="Confirm new password"
                                    autoComplete="new-password"
                                    value={passwords.confirmPassword}
                                    error={Boolean(passwords.confirmPassword) && !passwordsMatch}
                                    helperText={Boolean(passwords.confirmPassword) && !passwordsMatch ? "Passwords do not match." : " "}
                                    onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))}
                                />
                                <Box>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={saving || !canSubmit}
                                    >
                                        {saving ? "Updating..." : "Update password"}
                                    </Button>
                                </Box>
                            </Stack>
                        </Box>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    )
}
