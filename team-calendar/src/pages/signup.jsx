import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { GetTeams } from "../routes/team"
import { Signup } from "../routes/auth"

const EMPTY_SIGNUP_FORM = {
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    confirmPassword: '',
    team: '',
    role: ''
}

const ROLES = [
    {value: 'Admin'},
    {value: 'Manager'},
    {value: 'User'}
]

export const SignupPage = () => {

    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [form, setForm] = useState(EMPTY_SIGNUP_FORM)
    const [teams, setTeams] = useState([])

    const isValid = form.first_name.trim() && form.last_name.trim() && form.password.length >= 12 && form.confirmPassword === form.password && form.username.trim() && form.team.trim() && form.role

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!isValid) return;

        try{
            setError('')
            const signupData = {
                first_name: form.first_name,
                last_name: form.last_name,
                username: form.username,
                password: form.password,
                team: form.team,
                role: form.role
            }
            await Signup(signupData)
            navigate('/', { replace: true })
        }catch (error) {
            setError(error.message)
        }
    }

    useEffect(() => {
        let cancelled = false
        GetTeams().then(teamRequest => {
            if (!cancelled) {
                setTeams(teamRequest.map(team => ({
                    value: team.name,
                    label: team.name
                })))
            }
        }).catch(error => {
            if (!cancelled) {
                setError(`Could not load teams: ${error.message}`)
            }
        })

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 4 }}>
            <Box sx={{ width: '100%', maxWidth: 440 }}>
                <Paper variant="outlined" sx={{borderColor: 'divider', p: {xs: 3, md: 4}}}>
                    <Typography variant="h6">Create Account</Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Stack spacing={2.5}>
                            {error && <Typography color="error" role="alert">{error}</Typography>}
                            <TextField label="First Name" value={form.first_name} onChange={(e) => setForm({...form, first_name: e.target.value})} fullWidth autoFocus />
                            <TextField label="Last Name" value={form.last_name} onChange={(e) => setForm({...form, last_name: e.target.value})} fullWidth autoFocus />
                            <TextField label="Username" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} fullWidth autoFocus />
                            <TextField label="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} fullWidth autoFocus  type="password" helperText="At least 12 characters"/>
                            <TextField label="Confirm Password" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} fullWidth autoFocus  type="password" helperText={Boolean(form.confirmPassword) && form.confirmPassword !== form.password ? 'Passwords do not match' : ' '} error={Boolean(form.confirmPassword) && form.confirmPassword !== form.password}/>
                            <TextField select label="Team" value={form.team} onChange={(e) => setForm({...form, team: e.target.value})} fullWidth>
                                {teams.map((team) => (
                                    <MenuItem key={team.value} value={team.value}>
                                        {team.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField select label="Role" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} fullWidth>
                                {ROLES.map((role) =>(
                                    <MenuItem key={role.value} value={role.value}>
                                        {role.value}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Button type="submit" variant="contained" fullWidth disabled={!isValid}>
                                Create Account
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Box>
        </Box>
    )
}